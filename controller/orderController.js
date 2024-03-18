const mongoose = require("mongoose");
const Order = require("../models/order");
const User = require("../models/user");
const multer = require("multer");
const fs = require("fs");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
require("dotenv").config();

// Configure multer for file upload
const upload = multer({ dest: "uploads/" });
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: 'http://localhost:3000',
  service: "gmail",
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

exports.placeOrder = async (req, res) => {
  try {
    const { userId, foodId, paymentMode, quantity } = req.body;

    const userIdObject = new mongoose.Types.ObjectId(userId);
    console.log(userIdObject);
    console.log(req.user);

    const newOrder = new Order({
      userId: userIdObject,
      foodId,
      paymentMode,
      quantity,
      orderId: generateOrderId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newOrder.save();

    // const otpToken = generateOTP();
    // console.log(req.user.email);

    // Send order confirmation email with OTP
    // sendOrderConfirmationEmail(req.user.email, newOrder, otpToken);
   

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder.orderId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deliverOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        const userId = order.userId
        console.log(userId);

        // Find the user's email
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userEmail = user.email;

        // Generate OTP
        const otpToken = generateOTP();

        // Send order confirmation email with OTP
        await sendOrderConfirmationEmail(userEmail, orderId, otpToken);

        // Mark the order as delivered
        await markOrderAsDelivered(orderId, otpToken);

        res.json({ success: true, message: "Order delivered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

async function sendOrderConfirmationEmail(email, orderId, otpToken) {
    try {
        // Define email options 
        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: "Order Confirmation and OTP",
            html: `<p>Dear customer,</p><p>Your order with ID ${orderId} has been successfully placed.</p><p>Your OTP for order confirmation is: <strong>${otpToken}</strong></p><p>Thank you for shopping with us!</p>`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

exports.verifyOtp=async(req,res)=>{
    try {
      const { orderId, otp } = req.params;
  
      // Call a function to verify the OTP and mark the order as delivered
      const order = await markOrderAsDelivered(orderId, otp);
  
      // Optionally, you can handle the response accordingly
      res.json({ success: true, order });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

async function markOrderAsDelivered(orderId, otpToken) {
    try {
        // Find the order by its ID and update its status to "delivered"
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: "delivered", updatedAt: new Date() } },
            { new: true }
        );


        return updatedOrder; // Return the updated order
    } catch (error) {
        console.error("Error marking order as delivered:", error);
        throw error;
    }
}

const generateOTP = () => {
    return speakeasy.totp({
        secret: speakeasy.generateSecret({ length: 20 }).base32,
        encoding: "base32",
    });
};

// // Email configuration for Nodemailer
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Function to send order confirmation email with OTP
// const sendOrderConfirmationEmail = (email, order, otpToken) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Order Confirmation and OTP",
//     html: `<p>Dear customer,</p><p>Your order with ID ${order.orderId} has been successfully placed.</p><p>Your OTP for order confirmation is: <strong>${otpToken}</strong></p><p>Thank you for shopping with us!</p>`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error("Error sending order confirmation email:", error);
//     } else {
//       console.log("Order confirmation email sent:", info.response);
//     }
//   });
// };

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, imageLink } = req.body;
    const orderId = req.params.orderId;

    // Handle file upload
    upload.single("file")(req, res, async function (err) {
      if (err) {
        console.error("File upload error:", err);
        return res.status(500).json({ error: "File upload error" });
      }

      try {
        // Extract text data from file
        const textData = await extractTextFromFile(req.file);

        // Update order with feedback data
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            rating,
            imageLink,
            fileData: textData ? textData.link : null,
            updatedAt: new Date(),
          },
          { new: true }
        );

        if (!updatedOrder) {
          return res.status(404).json({ error: "Order not found" });
        }

        res.json({
          success: true,
          message: "Feedback submitted successfully",
          updatedOrder,
        });
      } catch (error) {
        console.error("Error processing feedback:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function generateOrderId() {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

async function extractTextFromFile(file) {
  if (!file || !file.path) {
    console.error(
      "Error extracting text from file: File or file path is missing"
    );
    return null;
  }

  try {
    // Read text from file
    const text = fs.readFileSync(file.path, "utf-8");

    // Save extracted text to a new file
    const textFilePath = `uploads/text_${Date.now()}.txt`;
    fs.writeFileSync(textFilePath, text);

    return { link: textFilePath };
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return null;
  }
}

// controllers/orderController.js
const OrderLocation = require("../models/orderLocation");

exports.updateOrderLocation = async (req, res) => {
  const { orderId, latitude, longitude } = req.body;

  try {
    const orderLocation = new OrderLocation({
      orderId: orderId,
      latitude: latitude,
      longitude: longitude,
    });

    await orderLocation.save();

    res.json({ success: true, orderLocation: orderLocation });
  } catch (error) {
    console.error("Error updating order location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

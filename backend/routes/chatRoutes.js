import express from "express";
import mongoose from "mongoose";
import ChatSession from "../models/chatSession.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateAIResponse } from "../services/aiService.js";

const router = express.Router();

// ===============================
// GET CHAT HISTORY
// ===============================
router.get("/", authMiddleware, async (req, res) => {
  try {
    let session = await ChatSession.findOne({
      userId: new mongoose.Types.ObjectId(req.user.id),
    });

    if (!session) {
      session = await ChatSession.create({
        userId: req.user.id,
        messages: [],
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
    });
  }
});

// ===============================
// SEND MESSAGE
// ===============================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let session = await ChatSession.findOne({
      userId: new mongoose.Types.ObjectId(req.user.id),
    });

    if (!session) {
      session = await ChatSession.create({
        userId: req.user.id,
        messages: [],
      });
    }

    // Save user message
    session.messages.push({
      role: "user",
      content: message,
    });

    // Last 10 messages as AI context
    const recentMessages = session.messages.slice(-10);

    // Generate AI response
    const aiReply = await generateAIResponse(recentMessages);

    // Save AI response
    session.messages.push({
      role: "ai",
      content: aiReply,
    });

    await session.save();

    res.status(200).json({
      success: true,
      reply: aiReply,
      messages: session.messages,
    });
  } catch (error) {
    console.error("Error sending chat message:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process chat message",
    });
  }
});

// ===============================
// CLEAR CHAT HISTORY
// ===============================
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await ChatSession.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(req.user.id),
    });

    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing chat history:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear chat history",
    });
  }
});

export default router;
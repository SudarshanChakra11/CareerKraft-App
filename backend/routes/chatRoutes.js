import express from "express";
import mongoose from "mongoose";
import ChatSession from "../models/chatSession.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateAIResponse } from "../services/aiService.js";

const router = express.Router();


// ✅ GET CHAT HISTORY
router.get("/", authMiddleware, async (req, res) => {
  try {
    let session = await ChatSession.findOne({
      userId: new mongoose.Types.ObjectId(req.user.id)
    });

    if (!session) {
      session = await ChatSession.create({
        userId: req.user.id,
        messages: []
      });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ SEND MESSAGE
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    let session = await ChatSession.findOne({
      userId: new mongoose.Types.ObjectId(req.user.id)
    });

    if (!session) {
      session = await ChatSession.create({
        userId: req.user.id,
        messages: []
      });
    }

    // Save user message
    session.messages.push({
      role: "user",
      content: message
    });

    // Context (last 10 messages)
    const recentMessages = session.messages.slice(-10);

    // AI response
    const aiReply = await generateAIResponse(recentMessages);

    // Save AI reply
    session.messages.push({
      role: "ai",
      content: aiReply
    });

    await session.save();

    res.json({
      reply: aiReply,
      messages: session.messages
    });

  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ CLEAR CHAT (FIXED — separate route)
router.delete("/", authMiddleware, async (req, res) => {
  try {
    console.log("🧹 CLEAR CHAT HIT"); // debug

    await ChatSession.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(req.user.id)
    });

    res.json({ message: "Chat cleared" });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


export default router;
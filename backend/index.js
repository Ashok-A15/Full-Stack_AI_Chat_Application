import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

dotenv.config();

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MONGO_URI = process.env.MONGO_URI;

const app = express();

// ---------------------- MIDDLEWARE ---------------------- //
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// ---------------------- MONGODB CONNECTION ---------------------- //
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// ---------------------- ROUTES ---------------------- //
app.get("/", (_req, res) => {
  res.send("🚀 API is running...");
});

// ---------------------- CREATE NEW CHAT ---------------------- //
app.post("/api/chats", async (req, res, next) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "userId and text are required" });
    }

    // Create a new chat document
    const newChat = new Chat({
      userId,
      history: [{ role: "user", parts: [{ text }] }],
    });
    const savedChat = await newChat.save();

    // Add chat to user's chat list
    let userChats = await UserChats.findOne({ userId });
    if (!userChats) {
      userChats = new UserChats({
        userId,
        chats: [{ _id: savedChat._id, title: text.substring(0, 40) }],
      });
    } else {
      userChats.chats.push({
        _id: savedChat._id,
        title: text.substring(0, 40),
      });
    }

    await userChats.save();

    console.log(`💬 Chat saved for userId: ${userId}`);
    res.status(201).json({ success: true, chat: savedChat });
  } catch (err) {
    console.error("❌ Error in /api/chats:", err);
    next(err);
  }
});

// ---------------------- GET USER CHATS BY PARAM ---------------------- //
app.get("/api/userchats/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userChats = await UserChats.findOne({ userId }).populate("chats._id");
    if (!userChats) return res.status(404).json({ message: "No chats found" });
    res.status(200).json(userChats.chats);
  } catch (err) {
    next(err);
  }
});

// ---------------------- GET USER CHATS (AUTHENTICATED) ---------------------- //
app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  try {
    const userChats = await UserChats.findOne({ userId }).populate("chats._id");

    if (!userChats) return res.status(404).json({ message: "No chats found" });

    res.status(200).json(userChats.chats);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching userchats!");
  }
});

// ---------------------- ERROR HANDLER ---------------------- //
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

// ---------------------- START SERVER ---------------------- //
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});

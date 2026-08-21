import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import ImageKit from "imagekit";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

dotenv.config();

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MONGO_URI = process.env.MONGO_URI;

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

const app = express();

// ---------------------- MIDDLEWARE ---------------------- //
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "AI Chat Backend Running" });
});

mongoose.set('bufferCommands', false);

// ---------------------- MONGODB CONNECTION ---------------------- //
const connectDB = async () => {
  try {
    if (!MONGO_URI || MONGO_URI.includes("<db_password>")) {
      console.warn("⚠️ MONGO_URI is missing or contains placeholder '<db_password>'. Please update backend/.env with your valid MongoDB connection string.");
      return;
    }
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error details:", err.message);
  }
};

// ---------------------- ROUTES ---------------------- //
app.get("/", (_req, res) => {
  res.send("🚀 API is running...");
});

// Middleware to handle database connection state gracefully
app.use("/api", (req, res, next) => {
  if (req.path === "/upload") return next();
  if (mongoose.connection.readyState !== 1) {
    if (req.path === "/userchats") {
      return res.status(200).json([]);
    }
    return res.status(503).json({
      error: "Database not connected. Please set your MongoDB password in backend/.env to save chats.",
    });
  }
  next();
});

// ---------------------- IMAGEKIT AUTH ---------------------- //
app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// ---------------------- CREATE NEW CHAT ---------------------- //
app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res, next) => {
  const userId = req.auth.userId;
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ error: "text is required" });
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
    res.status(201).json({ success: true, chatId: savedChat._id });
  } catch (err) {
    console.error("❌ Error in /api/chats:", err);
    next(err);
  }
});

// ---------------------- GET USER CHATS (AUTHENTICATED) ---------------------- //
app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  try {
    const userChats = await UserChats.findOne({ userId });

    if (!userChats) return res.status(200).json([]);

    res.status(200).json(userChats.chats);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching userchats!");
  }
});

// ---------------------- GET SPECIFIC CHAT (AUTHENTICATED) ---------------------- //
app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching chat!");
  }
});

// ---------------------- UPDATE CHAT HISTORY (AUTHENTICATED) ---------------------- //
app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { question, answer, img } = req.body;

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );
    res.status(200).send(updatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding message to history!");
  }
});

// ---------------------- DELETE CHAT (AUTHENTICATED) ---------------------- //
app.delete("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const chatId = req.params.id;

  try {
    await Chat.deleteOne({ _id: chatId, userId });

    await UserChats.updateOne(
      { userId },
      { $pull: { chats: { _id: chatId } } }
    );

    res.status(200).json({ success: true, message: "Chat deleted" });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).send("Error deleting chat!");
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

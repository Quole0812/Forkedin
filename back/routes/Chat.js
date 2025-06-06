import express from "express";
import { auth as adminAuth } from "../firebase.js";
import { adminInstance as admin } from "../firebase.js";
import dotenv from "dotenv";
import openai from "../app.js";
import { db } from "../firebase.js";
import { AdminPanelSettings } from "@mui/icons-material";

dotenv.config();
const router = express.Router();

// Middleware to verify Firebase ID token
async function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(403).send("Unauthorized");
  }

  const idToken = header.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    req.user = decodedToken; // attach the user info
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).send("Unauthorized");
  }
}

router.post("/", verifyToken, async (req, res) => {
  const { recipe, message } = req.body;
  const userId = req.user.uid;
  const recipeId = recipe.id || recipe.label || "unknown_recipe"; 

  try {
    console.log(`[${userId}] asked: ${message}`);

    const userChatRef = db
        .collection("chats")
        .doc(userId)
        .collection("recipes")
        .doc(recipeId)

    // append a new message
    await userChatRef.set({
        messages: admin.firestore.FieldValue.arrayUnion({
            role: "user",
            content: message,
            timestamp: Date.now()
        }),
        recipeLabel: recipe.label
    }, { merge: true });

    // read full message history for chatgpt context
    const chatDoc = await userChatRef.get();
    const chatData = chatDoc.data();
    const fullMessages = chatData?.messages || [];

    // call openai
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: fullMessages,
    });

    const assistantReply = response.choices[0].message.content;

    // save assistant reply
    await userChatRef.set({
        messages: admin.firestore.FieldValue.arrayUnion({
            role: "assistant",
            content: assistantReply,
            timestamp: Date.now()
        }),
    }, { merge: true });

    // return the assistant reply to the client
    res.json({ reply: assistantReply });
    } 
    catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
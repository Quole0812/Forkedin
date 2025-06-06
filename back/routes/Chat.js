import express from "express";
import { auth as adminAuth } from "../firebase.js"; // ⬅ use this!
import dotenv from "dotenv";
import openai from "../app.js";

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

  try {
    console.log(`[${userId}] asked: ${message}`);

    // dummy reply for now
    res.json({ reply: `Thanks for asking about ${recipe.label}, ${req.user.name || "friend"}!` });

    // for later: call openai if needed
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
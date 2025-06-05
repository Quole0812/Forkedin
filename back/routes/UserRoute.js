import express from "express";
import db from "../firebase.js";

const router = express.Router();

// GET user by UID
router.get("/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const userRef = db.collection("users").doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(doc.data());
  } catch (err) {
    console.error("Failed to fetch user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
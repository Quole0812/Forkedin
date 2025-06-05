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

// PATCH user update
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  console.log("Updating user:", id, "with:", updatedData);

  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  try {
    const userRef = db.collection('users').doc(id);
    await userRef.update({ ...updatedData });
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

// Batch fetch recipes by array of Firestore IDs
router.post("/batch", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "Expected 'ids' to be an array" });
  }

  try {
    const results = await Promise.all(
      ids
        .filter(id => typeof id === "string" && id.trim() !== "" && !id.includes("/"))
        .map(async (id) => {
          const doc = await db.collection("recipes").doc(id).get();
          return doc.exists ? { id: doc.id, ...doc.data() } : null;
        })
    );


    const filtered = results.filter(Boolean); // remove nulls
    res.json(filtered);
  } catch (err) {
    console.error("Error fetching recipe batch:", err);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

export default router;

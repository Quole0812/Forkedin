import express from "express";
import { db } from "../firebase.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// POST /recipes-by-ids
router.post("/", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "Expected an array of IDs" });
  }

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        if (id.startsWith("http")) {
          // Edamam recipe
          const edamamRes = await axios.get("https://api.edamam.com/api/recipes/v2/by-uri", {
            params: {
              type: "public",
              uri: id,
              app_id: process.env.EDAMAM_APP_ID,
              app_key: process.env.EDAMAM_APP_KEY,
            },
            headers: {
              "Edamam-Account-User": "bananavstaco",
            },
          });

          return edamamRes.data.hits[0]?.recipe || null;
        } else {
          // Firestore recipe
          const doc = await db.collection("recipes").doc(id).get();
          return doc.exists ? { id: doc.id, ...doc.data() } : null;
        }
      } catch (err) {
        console.error(`Failed to fetch recipe for ${id}:`, err.response?.data || err.message);
        return null;
      }
    })
  );


  res.json(results.filter(Boolean));
});

export default router;
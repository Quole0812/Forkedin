import express from "express";
import axios from "axios";
import dotenv from "dotenv"
// import admin from "firebase-admin"
import db from "../firebase.js";

dotenv.config();

const router = express.Router();

router.get("/official", async (req, res) => {
  const { query } = req.query;
  try {
    const edamamRes = await axios.get("https://api.edamam.com/api/recipes/v2", {
      params: {
        type: "public",
        q: query,
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        to: 10
      }, 
      headers: {
        "Edamam-Account-User": "bananavstaco",
      }
    });
    console.log("lol trynna look for this")
    console.log(edamamRes);
    res.json(edamamRes.data.hits);
  } catch (err) {
    console.error("Failed to fetch Edamam recipes:", err?.response?.data || err.message);
    res.status(500).json({ error: "my fellow brother of america, we failed to get recipe" });
  }
});

//get default route 

router.get("/default", async (req, res) => {
  const { query } = req.query;
  try {
    const edamamRes = await axios.get("https://api.edamam.com/api/recipes/v2", {
      params: {
        type: "public",
        cuisineType: query,
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        to: 10
      }, 
      headers: {
        "Edamam-Account-User": "bananavstaco",
      }
    });
    console.log("lol trynna look for this")
    console.log(edamamRes);
    res.json(edamamRes.data.hits);
  } catch (err) {
    console.error("Failed to fetch Edamam recipes:", err?.response?.data || err.message);
    res.status(500).json({ error: "my fellow brother of america, we failed to get recipe" });
  }
});


//get recipe of a user
router.get("/user", async (req, res) => {
  console.log("its time to shine");
  const query = req.query.query?.toLowerCase() || "";

  try {
    const recipesRef = db.collection("recipes"); 
    const snapshot = await recipesRef.get();

    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(recipe => recipe.name?.toLowerCase().includes(query)); 
    res.json(results);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes from Firestore" });
  }
});



export default router;
import express from "express";
import axios from "axios";
import dotenv from "dotenv"
// import admin from "firebase-admin"
import { db } from "../firebase.js";

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

// get official recipes
router.get("/official", async (req, res) => {
  const { query } = req.query;
  try {
    const edamamRes = await axios.get("https://api.edamam.com/api/recipes/v2", {
      params: {
        type: "public",
        q: query,
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        to: 20
      }, 
      headers: {
        "Edamam-Account-User": "bananavstaco",
      }
    });
    res.json(edamamRes.data.hits);
  } catch (err) {
    console.error("Failed to fetch Edamam recipes:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// get specific recipe by URI
router.get("/recipe/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Decode the URI since it was URL encoded
    const decodedUri = decodeURIComponent(id);
    
    const edamamRes = await axios.get("https://api.edamam.com/api/recipes/v2/by-uri", {
      params: {
        type: "public",
        uri: decodedUri,
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY
      }, 
      headers: {
        "Edamam-Account-User": "bananavstaco",
      }
    });
    
    if (edamamRes.data.hits && edamamRes.data.hits.length > 0) {
      res.json(edamamRes.data.hits[0]);
    } else {
      res.status(404).json({ error: "Recipe not found" });
    }
  } catch (err) {
    console.error("Failed to fetch specific recipe:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch recipe details" });
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

// GET recipes by author UID
router.get("/user/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const recipesRef = db.collection("recipes");
    const snapshot = await recipesRef.where("authorId", "==", uid).get();

    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(recipes);
  } catch (err) {
    console.error("Error fetching user's recipes:", err);
    res.status(500).json({ error: "Failed to fetch user's recipes" });
  }
});

// Get unpublished recipes (admin only)
router.get("/unpublished", async (req, res) => {
  try {
    const snapshot = await db.collection("recipes").where("published", "==", false).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    console.error("Error fetching unpublished recipes:", err);
    res.status(500).json({ error: "Failed to fetch unpublished" });
  }
});

// Publish a recipe
router.patch("/publish/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection("recipes").doc(id).update({ published: true });
    res.json({ message: "Recipe published" });
  } catch (err) {
    console.error("Error publishing recipe:", err);
    res.status(500).json({ error: "Failed to publish" });
  }
});


export default router;
import express from "express";
import { db, auth } from "../firebase.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const router = express.Router();

// Middleware to verify Firebase ID token
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Check if username is available
router.get("/check-username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username || username.length < 3) {
      return res.status(400).json({ 
        error: "Username must be at least 3 characters long" 
      });
    }

    const usersRef = db.collection('users');
    const query = usersRef.where('username', '==', username.toLowerCase());
    const snapshot = await query.get();

    res.json({ 
      available: snapshot.empty,
      message: snapshot.empty ? 'Username is available' : 'Username is already taken'
    });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username availability' });
  }
});

// Create user in database (called after Firebase Auth signup)
router.post("/create", async (req, res) => {
  try {
    const { uid, fullName, username, email } = req.body;

    if (!uid || !fullName || !username || !email) {
      return res.status(400).json({ 
        error: "Missing required fields: uid, fullName, username, email" 
      });
    }

    // Check if username is available
    const usersRef = db.collection('users');
    const usernameQuery = usersRef.where('username', '==', username.toLowerCase());
    const usernameSnapshot = await usernameQuery.get();

    if (!usernameSnapshot.empty) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    // Create user document
    const userData = {
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await db.collection('users').doc(uid).set(userData);

    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: uid, ...userData }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user's last login
router.post("/login", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Get user data
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      // If user doesn't exist in database, create basic record
      const userData = {
        fullName: req.user.name || 'Unknown',
        username: req.user.email?.split('@')[0] || 'user',
        email: req.user.email || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      await db.collection('users').doc(uid).set(userData);
      return res.json({ 
        message: 'User logged in and profile created',
        user: { id: uid, ...userData }
      });
    }

    // Update last login
    await db.collection('users').doc(uid).update({
      lastLogin: new Date().toISOString()
    });

    const userData = userDoc.data();
    res.json({ 
      message: 'User logged in successfully',
      user: { id: uid, ...userData }
    });
  } catch (error) {
    console.error('Error updating login:', error);
    res.status(500).json({ error: 'Failed to update login' });
  }
});

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({ 
      user: { id: uid, ...userData }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { fullName, username } = req.body;

    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (username) {
      // Check if new username is available
      const usersRef = db.collection('users');
      const query = usersRef.where('username', '==', username.toLowerCase());
      const snapshot = await query.get();
      
      // Check if username is taken by someone else
      const isUsernameAvailable = snapshot.empty || 
        (snapshot.size === 1 && snapshot.docs[0].id === uid);
      
      if (!isUsernameAvailable) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      
      updates.username = username.toLowerCase();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.updatedAt = new Date().toISOString();

    await db.collection('users').doc(uid).update(updates);

    // Get updated user data
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    res.json({ 
      message: 'Profile updated successfully',
      user: { id: uid, ...userData }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user by ID (for public profiles)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Return full user data for internal/private use
    res.json({
      id: userId,
      ...userData
    });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// PATCH user update
router.patch("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;

    if (!uid || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Missing UID or update fields" });
    }

    await db.collection("users").doc(uid).update(updates);
    const updatedDoc = await db.collection("users").doc(uid).get();
    const userData = updatedDoc.data();

    res.json({ message: "User updated successfully", user: { id: uid, ...userData } });
  } catch (error) {
    console.error("Error updating user by UID:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// GET all saved recipes (user-generated + Edamam)
router.get("/saved-recipes/:uid", async (req, res) => {
  console.log(`[GET] /users/saved-recipes/${req.params.uid}`);
  try {
    const { uid } = req.params;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const saved = userDoc.data()?.saved || [];

    const internalIds = saved.filter(item => !item.startsWith("http"));
    const edamamUris = saved.filter(item => item.startsWith("http"));

    // Fetch internal (Firestore) recipes
    const internalResults = await Promise.all(
      internalIds.map(async id => {
        try {
          const doc = await db.collection("recipes").doc(id).get();
          return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch {
          return null;
        }
      })
    );

    // Fetch Edamam recipes
    const edamamResults = await Promise.all(
      edamamUris.map(async uri => {
        try {
          const res = await axios.get("https://api.edamam.com/api/recipes/v2/by-uri", {
            params: {
              type: "public",
              uri: uri,
              app_id: process.env.EDAMAM_APP_ID,
              app_key: process.env.EDAMAM_APP_KEY,
            },
              headers: {
              "Edamam-Account-User": "bananavstaco",
            },
          });
          return res.data.hits[0]?.recipe || null;
        } catch (err) {
          console.error(`Failed to fetch Edamam recipe for ${uri}:`, err?.response?.data || err.message);
          return null;
        }
      })
    );

    const allRecipes = [...internalResults, ...edamamResults].filter(Boolean);
    res.json(allRecipes);
  } catch (error) {
    console.error("Error fetching saved recipes:", error);
    res.status(500).json({ error: "Failed to fetch saved recipes" });
  }
});


export default router; 
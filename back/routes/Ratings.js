import express from 'express';
import { db, auth } from '../firebase.js';

const router = express.Router();

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function to create safe document ID from recipe URI (same as Comments.js)
const getRecipeDocId = (uri) => {
  return uri.replace(/[\/\[\]#]/g, '_');
};

// Get ratings for a recipe
router.get('/recipe/:recipeUri', async (req, res) => {
  try {
    const { recipeUri } = req.params;
    const recipeDocId = getRecipeDocId(decodeURIComponent(recipeUri));
    
    const ratingsRef = db.collection('recipes').doc(recipeDocId).collection('ratings');
    const snapshot = await ratingsRef.orderBy('createdAt', 'desc').get();
    
    const ratings = [];
    let totalPoints = 0;
    let totalRatings = 0;
    
    snapshot.docs.forEach(doc => {
      const ratingData = { id: doc.id, ...doc.data() };
      ratings.push(ratingData);
      totalPoints += ratingData.rating;
      totalRatings++;
    });
    
    const averageRating = totalRatings > 0 ? Math.round((totalPoints / totalRatings) * 10) / 10 : 0;
    
    res.json({
      ratings,
      averageRating,
      totalRatings
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Add or update a rating for a recipe
router.post('/recipe/:recipeUri', verifyToken, async (req, res) => {
  try {
    const { recipeUri } = req.params;
    const { rating } = req.body;
    const uid = req.user.uid;

    // Validate rating value
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    // Get user data from the users collection
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    const recipeDocId = getRecipeDocId(decodeURIComponent(recipeUri));
    const ratingsRef = db.collection('recipes').doc(recipeDocId).collection('ratings');
    
    // Check if user already has a rating for this recipe
    const existingRatingQuery = await ratingsRef.where('authorId', '==', uid).get();
    
    const ratingData = {
      rating,
      authorId: uid,
      authorName: userData?.fullName || req.user.name || 'Anonymous',
      authorUsername: userData?.username || req.user.email?.split('@')[0] || 'user',
      recipeUri: decodeURIComponent(recipeUri),
      updatedAt: new Date()
    };

    if (!existingRatingQuery.empty) {
      // Update existing rating
      const existingRatingDoc = existingRatingQuery.docs[0];
      await existingRatingDoc.ref.update(ratingData);
      
      res.json({ 
        message: 'Rating updated successfully',
        rating: { id: existingRatingDoc.id, ...ratingData }
      });
    } else {
      // Add new rating
      ratingData.createdAt = new Date();
      const docRef = await ratingsRef.add(ratingData);
      
      res.status(201).json({ 
        message: 'Rating added successfully',
        rating: { id: docRef.id, ...ratingData }
      });
    }
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

// Delete a rating for a recipe (only by author)
router.delete('/recipe/:recipeUri', verifyToken, async (req, res) => {
  try {
    const { recipeUri } = req.params;
    const uid = req.user.uid;

    const recipeDocId = getRecipeDocId(decodeURIComponent(recipeUri));
    const ratingsRef = db.collection('recipes').doc(recipeDocId).collection('ratings');
    
    // Find user's rating
    const userRatingQuery = await ratingsRef.where('authorId', '==', uid).get();
    
    if (userRatingQuery.empty) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    
    const userRatingDoc = userRatingQuery.docs[0];
    await userRatingDoc.ref.delete();

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
});

// Get all ratings by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query all recipes to find ratings by this user
    const recipesSnapshot = await db.collection('recipes').get();
    const userRatings = [];
    
    for (const recipeDoc of recipesSnapshot.docs) {
      const ratingsRef = recipeDoc.ref.collection('ratings');
      const userRatingQuery = await ratingsRef.where('authorId', '==', userId).get();
      
      if (!userRatingQuery.empty) {
        const ratingData = userRatingQuery.docs[0].data();
        userRatings.push({
          recipeUri: ratingData.recipeUri,
          rating: ratingData.rating,
          createdAt: ratingData.createdAt,
          updatedAt: ratingData.updatedAt
        });
      }
    }

    res.json({ ratings: userRatings });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ error: 'Failed to fetch user ratings' });
  }
});

export default router; 
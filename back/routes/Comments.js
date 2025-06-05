import express from "express";
import { db, auth } from "../firebase.js";
import dotenv from "dotenv";

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

// Helper function to create safe document ID from recipe URI
const getRecipeDocId = (uri) => {
  return uri.replace(/[\/\[\]#]/g, '_');
};

// Get all comments for a recipe
router.get("/recipe/:recipeUri", async (req, res) => {
  try {
    const { recipeUri } = req.params;
    const recipeDocId = getRecipeDocId(decodeURIComponent(recipeUri));
    
    const commentsRef = db.collection('recipes').doc(recipeDocId).collection('comments');
    const snapshot = await commentsRef.orderBy('createdAt', 'desc').get();
    
    const comments = [];
    for (const doc of snapshot.docs) {
      const commentData = { id: doc.id, ...doc.data() };
      
      // Fetch replies for this comment
      const repliesRef = commentsRef.doc(doc.id).collection('replies');
      const repliesSnapshot = await repliesRef.orderBy('createdAt', 'asc').get();
      
      commentData.replies = repliesSnapshot.docs.map(replyDoc => ({
        id: replyDoc.id,
        ...replyDoc.data()
      }));
      
      comments.push(commentData);
    }
    
    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a new comment to a recipe
router.post("/recipe/:recipeUri", verifyToken, async (req, res) => {
  try {
    const { recipeUri } = req.params;
    const { text } = req.body;
    const uid = req.user.uid;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    // Get user data from the users collection
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    const recipeDocId = getRecipeDocId(decodeURIComponent(recipeUri));
    const commentsRef = db.collection('recipes').doc(recipeDocId).collection('comments');
    
    const commentData = {
      text: text.trim(),
      authorId: uid,
      authorName: userData?.fullName || req.user.name || 'Anonymous',
      authorUsername: userData?.username || req.user.email?.split('@')[0] || 'user',
      createdAt: new Date(),
      recipeUri: decodeURIComponent(recipeUri)
    };
    
    const docRef = await commentsRef.add(commentData);
    
    res.status(201).json({ 
      message: 'Comment added successfully',
      comment: { id: docRef.id, ...commentData }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Add a reply to a comment
router.post("/recipe/:recipeUri/comment/:commentId/reply", verifyToken, async (req, res) => {
  try {
    const { recipeUri, commentId } = req.params;
    const { text } = req.body;
    const uid = req.user.uid;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }
    
    // Get user data from the users collection
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    const recipeDocId = getRecipeDocId(decodeURIComponent(recipeUri));
    const repliesRef = db.collection('recipes').doc(recipeDocId)
      .collection('comments').doc(commentId).collection('replies');
    
    const replyData = {
      text: text.trim(),
      authorId: uid,
      authorName: userData?.fullName || req.user.name || 'Anonymous',
      authorUsername: userData?.username || req.user.email?.split('@')[0] || 'user',
      createdAt: new Date(),
      recipeUri: decodeURIComponent(recipeUri)
    };
    
    const docRef = await repliesRef.add(replyData);
    
    res.status(201).json({ 
      message: 'Reply added successfully',
      reply: { id: docRef.id, ...replyData }
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Delete a comment (only by author)
router.delete("/recipe/:recipeUri/comment/:commentId", verifyToken, async (req, res) => {
  try {
    const { recipeUri, commentId } = req.params;
    const uid = req.user.uid;
    
    const recipeDocId = getRecipeDocId(decodeURIComponent(recipeUri));
    const commentRef = db.collection('recipes').doc(recipeDocId)
      .collection('comments').doc(commentId);
    
    const commentDoc = await commentRef.get();
    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const commentData = commentDoc.data();
    if (commentData.authorId !== uid) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    // Delete all replies first
    const repliesRef = commentRef.collection('replies');
    const repliesSnapshot = await repliesRef.get();
    const batch = db.batch();
    
    repliesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the comment
    batch.delete(commentRef);
    await batch.commit();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Delete a reply (only by author)
router.delete("/recipe/:recipeUri/comment/:commentId/reply/:replyId", verifyToken, async (req, res) => {
  try {
    const { recipeUri, commentId, replyId } = req.params;
    const uid = req.user.uid;
    
    const recipeDocId = getRecipeDocId(decodeURIComponent(recipeUri));
    const replyRef = db.collection('recipes').doc(recipeDocId)
      .collection('comments').doc(commentId).collection('replies').doc(replyId);
    
    const replyDoc = await replyRef.get();
    if (!replyDoc.exists) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    
    const replyData = replyDoc.data();
    if (replyData.authorId !== uid) {
      return res.status(403).json({ error: 'Not authorized to delete this reply' });
    }
    
    await replyRef.delete();
    
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

export default router; 
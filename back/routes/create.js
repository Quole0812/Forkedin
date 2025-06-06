import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import { db, auth } from "../firebase.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-west-2"
});

const s3 = new AWS.S3();
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

/* 
    POST: creates new document @ 'recipes' collection
    Fields (string): 
        - calories
        - ingredients:
            - name
            - qty
            - unit
            - note
        - name
        - yieldAmt
        - directions
        - image
        - source
        - url
        - totalTime
        - cuisineType
        - mealType
        - dishType
        - dietLabels
        - healthLabels
        - cautions
        - instructions
        - ingredientLines
        - published (automatically set to false)
*/
router.post("/", verifyToken, upload.single("image"), async (req, res) => {    
    try {
        const { 
            name, 
            calories, 
            yieldAmt, 
            source,
            url,
            totalTime,
            cuisineType,
            mealType,
            dishType,
            dietLabels,
            healthLabels,
            cautions,
            instructions,
            ingredientLines
        } = req.body;
        
        const ingredients = JSON.parse(req.body.ingredients);
        let imageUrl = "";

        if (req.file) {
            const params = {
                Bucket: "forkedin",
                Key: `recipes/${Date.now()}_${req.file.originalname}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            };

            const uploadResult = await s3.upload(params).promise();
            imageUrl = uploadResult.Location;
        }

        console.log("Incoming recipe post:");
        console.log("calories:", calories);
        console.log("name:", name);
        console.log("yieldAmt:", yieldAmt);
        console.log("image:", imageUrl);
        console.log("source:", source);
        console.log("url:", url);
        console.log("totalTime:", totalTime);

        console.log("ingredients:", ...ingredients);
        if (!Array.isArray(ingredients)) {
            console.warn("⚠️ ingredients is not an array!");
        } else {
            ingredients.forEach((item, idx) => {
                console.log(`Ingredient ${idx}:`);
                for (const key in item) {
                    console.log(`  ${key}:`, item[key]);
                }
            });
        }

        // Parse JSON fields that come as strings
        const parsedCuisineType = cuisineType ? JSON.parse(cuisineType) : [];
        const parsedMealType = mealType ? JSON.parse(mealType) : [];
        const parsedDishType = dishType ? JSON.parse(dishType) : [];
        const parsedDietLabels = dietLabels ? JSON.parse(dietLabels) : [];
        const parsedHealthLabels = healthLabels ? JSON.parse(healthLabels) : [];
        const parsedCautions = cautions ? JSON.parse(cautions) : [];
        const parsedInstructions = instructions ? JSON.parse(instructions) : [];
        const parsedIngredientLines = ingredientLines ? JSON.parse(ingredientLines) : [];

        // Create recipe object that matches Edamam API structure for compatibility
        const post = {
            // Original fields
            name,
            calories: parseInt(calories) || 0,
            yieldAmt: parseInt(yieldAmt) || 1,
            ingredients,
            image: imageUrl,
            
            // New fields for recipe details compatibility
            label: name, // Recipe details page expects 'label' field
            source: source || "User Created",
            url: url || "",
            yield: parseInt(yieldAmt) || 1, // Recipe details expects 'yield' not 'yieldAmt'
            totalTime: parseInt(totalTime) || 0,
            cuisineType: parsedCuisineType,
            mealType: parsedMealType,
            dishType: parsedDishType,
            dietLabels: parsedDietLabels,
            healthLabels: parsedHealthLabels,
            cautions: parsedCautions,
            instructions: parsedInstructions,
            ingredientLines: parsedIngredientLines,
            
            // Add timestamp for user-created recipes
            createdAt: new Date().toISOString(),
            isUserCreated: true,
            
            // Add published field set to false by default
            published: false,
            
            // Add creator information
            createdBy: req.user.uid
        };
        
        const ref = await db.collection("recipes").add(post);
        
        // Add the recipe ID to the user's created collection
        const userRef = db.collection("users").doc(req.user.uid);
        
        try {
            await userRef.update({
                created: db.FieldValue.arrayUnion(ref.id)
            });
        } catch (updateError) {
            // If the user document doesn't exist or doesn't have a 'created' field, initialize it
            console.log("Initializing created array for user:", req.user.uid);
            await userRef.set({
                created: [ref.id]
            }, { merge: true });
        }
        
        res.json({ id: ref.id, message: "the recipe has been made" });
    }
    catch (error) {
        console.error("Could not make post:", error);
        res.status(500).json({ error: 'Internal server error'});
    }
});

export default router;
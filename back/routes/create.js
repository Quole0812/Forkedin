import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import { db } from "../firebase.js";
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

/* 
    POST: creates new document @ 'recipes' collection
    Fields (string): 
        - calories:
        - ingredients:
            - name
                - qty
                - unit
                - note
        - name
        - yieldAmt
        - directions
        - image
*/
router.post("/", upload.single("image"), async (req, res) => {    
    try {
        const { name, calories, yieldAmt, directions } = req.body;
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
        console.log("directions:", directions);
        console.log("image:", imageUrl);

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

        const post = {
            name,
            calories,
            yieldAmt,
            directions,
            ingredients,
            image: imageUrl
        };
        
        const ref = await db.collection("recipes").add(post);
        res.json({ id: ref.id, message: "the recipe has been made" });
    }
    catch (error) {
        console.error("Could not make post:", error);
        res.status(500).json({ error: 'Internal server error'});
    }
});

export default router;
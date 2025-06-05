import db from "../firebase.js";
import express from "express";
const router = express.Router();
import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp();
}

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
router.post("/", async (req, res) => {
    try {
        const { calories, ingredients, name, yieldAmt, directions, image } = req.body;

        console.log("Incoming recipe post:");
        console.log("calories:", calories);
        console.log("name:", name);
        console.log("yieldAmt:", yieldAmt);
        console.log("directions:", directions);
        console.log("image:", image);

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
            calories,
            ingredients,
            name,
            yieldAmt,
            directions,
            image
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
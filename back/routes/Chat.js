import express from "express";
import { db } from "../firebase.js";
import dotenv from "dotenv";
import openai from "../app.js";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
    const { recipe } = req.body;

    try {
        const response = await openai.chat.completion.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "assistant", content: `Would you like help making ${recipe.label}` }]
        });

        const reply = response.choices[0].message.content;
        res.json({ reply });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

export default router;
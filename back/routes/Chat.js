import express from "express";
import { db } from "../firebase.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
    const { message } = req.body;

    try {
        const response = await openai.chat.completion.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "assistant", content: "You are only allowed to help users based on the recipe information." }]
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
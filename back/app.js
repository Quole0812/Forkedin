import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import cors from "cors";
import createRouter from "./routes/create.js";

dotenv.config(); // Load the .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 5001;

// use middleware to parse json request bodies
app.use(bodyParser.json());
app.use(cors());

// const createRouter = require("./routes/create");

app.use("/create", createRouter);


app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});




//get for completion if u wanna use
app.post('/chat', async (req, res) => {
    const { messages } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            messages: messages, 
            model: "gpt-3.5-turbo"
        });
        const answer = completion.choices[0].message.content;
        res.json(answer);
    } catch (error) {
        console.error("bruh we can't get the chat", error);
    }
})
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import cors from "cors";
import createRouter from "./routes/create.js";
import recipeDisplay from "./routes/RecipeDisplay.js";
import Users from "./routes/Users.js";
import Comments from "./routes/Comments.js";
import RecipesByIds from "./routes/RecipesByIds.js";
import Chat from "./routes/Chat.js";
// import admin from "firebase-admin"

// if (!admin.apps.length) {
//   admin.initializeApp();
// }

dotenv.config(); // Load the .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 5001;

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

// use middleware to parse json request bodies
app.use(bodyParser.json());
app.use(cors());

// const createRouter = require("./routes/create");

app.use("/create", createRouter);



app.use("/recipedisplay", recipeDisplay);
app.use("/users", Users);
app.use("/comments", Comments);
app.use("/recipes-by-ids", RecipesByIds);
app.use("/chat", Chat);



app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});

export default openai;


//get for completion if u wanna use
// app.post('/chat', async (req, res) => {
//     const { messages } = req.body;
//     try {
//         const completion = await openai.chat.completions.create({
//             messages: messages, 
//             model: "gpt-3.5-turbo"
//         });
//         const answer = completion.choices[0].message.content;
//         res.json(answer);
//     } catch (error) {
//         console.error("bruh we can't get the chat", error);
//     }
// })
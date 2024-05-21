import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
// import { Configuration, OpenAIApi } from 'openai';
import OpenAI from "openai";
import { bot, answering, profile } from './PersonalProfile.js';

const app = express();

dotenv.config();

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.API_KEY
});

// Listening
app.listen(process.env.PORT || 5001, () => {
    console.log(`Server is running on port ${process.env.PORT || 5001}`);
});

// Dummy route to test
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Post route for making requests
app.post('/', async (req, res) => {
    const { message } = req.body;

    let text = bot + answering + profile;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",  // Ensure this is a valid model name
            messages: [
                { role: "system", content: text },
                { role: "user", content: message }
            ],
            max_tokens: 300,
        });

        console.log("OpenAI API response:", response); // Log the full response

        if (response.choices && response.choices[0] && response.choices[0].message) {
            res.json({ message: response.choices[0].message.content.trim() });
        } else {
            console.error("Unexpected API response structure", response);
            res.status(500).json({ error: "Unexpected API response structure" });
        }
    } catch (e) {
        console.error("OpenAI API error", e.response ? e.response.data : e.message);
        res.status(500).json({ error: "OpenAI API error", details: e.response ? e.response.data : e.message });
    }
});
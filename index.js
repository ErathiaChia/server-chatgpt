import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import { bot, answering, profile } from './PersonalProfile.js';

const app = express();

dotenv.config();

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

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
    let persona = bot;
    let guidelines = answering;
    let oneshot = profile;

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4o",  // Ensure this is a valid model name
            messages: [
                { role: "system", content: persona },
                { role: "assistant", content: guidelines},
                { role: "user", content: oneshot },
                { role: "user", content: message },
            ],
            max_tokens: 300,
        });

        console.log("OpenAI API full response:", response); // Log the full response

        if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
            res.json({ message: response.data.choices[0].message.content.trim() });
        } else {
            console.error("Unexpected API response structure", response.data);
            res.status(500).json({ error: "Unexpected API response structure" });
        }
    } catch (e) {
        console.error("OpenAI API error", e.response ? e.response.data : e.message);
        res.status(500).json({ error: "OpenAI API error", details: e.response ? e.response.data : e.message });
    }
});
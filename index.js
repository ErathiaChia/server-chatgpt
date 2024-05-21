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

// Configure OpenAI API
const configuration = new Configuration({
    apiKey: process.env.API_KEY, // Ensure this key is correctly set in your .env file
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

    let text = bot + answering + profile;

    // Declare a boolean flag variable
    // let isFirstTime = true;

    // Void this as chat completion changed. // Check the flag to determine the action
    // if (isFirstTime) {
    //     // Code to execute if it's the first time
    //     text = bot + answering + profile + `${message}`;
    //     // Set the flag to false to indicate it's no longer the first time
    //     isFirstTime = false;
    // } else {
    //     // Code to execute if it's not the first time
    //     text = `${message}`;
    //     // Additional actions can be performed here
    // }

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4o",  // Use the correct model name
            messages: [{ role: "SYSTEM", content: text },
            { role: "user", content: {message} }],
            max_tokens: 300,
        });

        console.log("OpenAI API response:", response); // Log the full response

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
"use node";

import { action } from "./_generated/server";
import fetch from 'node-fetch';
import { v } from "convex/values";

export const generateWavenetAudio = action({
    args: { text: v.string() },
    handler: async (ctx, { text }) => {
        if (!text) {
            throw new Error("Text to speak is required.");
        }

        const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
        if (!apiKey) {
            console.error("Google Cloud API Key is not set in environment variables.");
            throw new Error("Internal server error: TTS service not configured.");
        }

        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

        const requestBody = {
            input: { text: text },
            voice: {
                languageCode: 'en-US',
                name: 'en-US-Wavenet-D',
                ssmlGender: 'FEMALE'
            },
            audioConfig: { audioEncoding: 'MP3' },
        };

        try {
            const googleResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!googleResponse.ok) {
                const errorBody = await googleResponse.text();
                console.error('Google TTS API Error:', googleResponse.status, errorBody);
                throw new Error(`Google TTS API Error: ${googleResponse.status}`);
            }

            const data = await googleResponse.json();
            
            // The audio content is returned as a base64-encoded string.
            return data;

        } catch (error) {
            console.error('Error contacting Google TTS API:', error);
            throw new Error("Failed to generate audio.");
        }
    }
}); 
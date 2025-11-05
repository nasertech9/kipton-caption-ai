
import { GoogleGenAI, Type } from "@google/genai";
import { CaptionOptions, GeneratedCaptions } from "../types";
import { fileToGenerativePart, getVideoPoster } from "../utils/video";

// IMPORTANT: Do not expose this key publicly.
// It's assumed that `process.env.API_KEY` is replaced by a secure build process
// or handled by a backend proxy. For this client-side example, it's used directly.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY is not defined. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        short: { 
            type: Type.OBJECT,
            properties: { text: { type: Type.STRING } }
        },
        long: { 
            type: Type.OBJECT,
            properties: { text: { type: Type.STRING } }
        },
        hashtags: { 
            type: Type.OBJECT,
            properties: { text: { type: Type.STRING, description: 'A space-separated list of relevant hashtags, starting with #' } }
        },
        seoTitle: { 
            type: Type.OBJECT,
            properties: { text: { type: Type.STRING, description: 'A catchy, SEO-friendly title under 60 characters.' } }
        },
    },
    required: ["short", "long", "hashtags", "seoTitle"]
};

export async function generateCaptions(
    file: File, 
    options: CaptionOptions
): Promise<GeneratedCaptions> {

    let filePart;
    let fileTypePrompt = "image";
    if (file.type.startsWith("video/")) {
        const posterBase64 = await getVideoPoster(file, true); // Get base64 poster
        if (!posterBase64) throw new Error("Could not extract frame from video.");
        filePart = {
            inlineData: {
                data: posterBase64,
                mimeType: "image/jpeg"
            }
        };
        fileTypePrompt = "video still frame";
    } else {
        filePart = await fileToGenerativePart(file);
    }

    const prompt = `
        Analyze this ${fileTypePrompt}. Generate a set of captions with the following characteristics:
        - Tone: ${options.tone}
        - Length: ${options.length}
        - Language: ${options.language}
        
        Provide one short caption (1-2 sentences), one long caption (3-4 sentences), a list of ${options.includeHashtags ? '5-10' : '0'} relevant hashtags, and a concise SEO title.
        The content is about: [the visual elements, mood, and subject of the image/video frame].
        Structure your response strictly according to the provided JSON schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [filePart, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.8,
            }
        });

        const jsonResponse = JSON.parse(response.text);

        // Add unique IDs to the parsed response
        const fullResponse: GeneratedCaptions = {
            short: { ...jsonResponse.short, id: `short-${Date.now()}` },
            long: { ...jsonResponse.long, id: `long-${Date.now()}` },
            hashtags: { ...jsonResponse.hashtags, id: `hashtags-${Date.now()}` },
            seoTitle: { ...jsonResponse.seoTitle, id: `seo-${Date.now()}` },
        };
        
        return fullResponse;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to generate captions from the AI model.");
    }
}

import { ai } from "./gemini.js";

export async function createEmbedding(text) {
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: text,
        config: {
            outputDimensionality: 768
        }
    });

    return response.embeddings[0].values;
}
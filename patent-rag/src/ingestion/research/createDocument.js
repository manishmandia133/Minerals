import { createEmbedding } from "../../ai/embeddings.js";

export async function createDocument(data) {

    const embeddingText = `
Title: ${data.title}
Abstract: ${data.abstract}
Organisation: ${data.organisation ?? ""}
Mineral: ${data.mineral ?? ""}
Technology Area: ${data.technology_area ?? ""}
`;

    const embedding = await createEmbedding(
        embeddingText
    );

    return {
        ...data,
        embedding
    };
}
import { ai } from "../ai/gemini.js";

export async function resolveQuestion(question, history) {

    if (history.length === 0) {
        return question;
    }

    const prompt = `
You are helping resolve a user's question in an ongoing conversation.

Use the conversation history to understand what the user's current question refers to.

Rewrite the current question into a complete, standalone question.

Do not answer the question.
Return only the rewritten question.

Conversation history:
${history
            .map((message) => `${message.role}: ${message.content}`)
            .join("\n")}

Current question:
${question}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    });

    return response.text.trim();
}
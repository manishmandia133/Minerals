import { ai } from "../ai/gemini.js";

export async function generateAnswer(question, context) {

    const prompt = `
You are a research assistant.

Answer the user's question using only the provided research documents and patents.

If the documents do not contain enough information to answer the question, say so clearly.

Knowledge documents:

${context}

User question:

${question}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    });

    return response.text;
}


export async function generateSqlAnswer(question, result) {

    const prompt = `
You are a research assistant.

Answer the user's question using the database result provided below.

Do not mention the database, SQL query, database result, or how the answer was obtained.

Answer naturally and directly.

Do not perform another calculation.

Do not invent or change the database result.

Use the result exactly as provided.

Database result:

${JSON.stringify(result, null, 2)}

User question:

${question}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    });

    return response.text;
}


export async function generateGapAnswer(
    question,
    research,
    gap,
    patents
) {

    const prompt = `
You are a research assistant.

Explain the patent coverage analysis for the user's question.

Use only the provided information.

Do not claim that a patent gap definitely exists.

Use phrases such as "potential gap", "limited coverage",
or "no obvious gap" where appropriate.

Research:

${JSON.stringify(research, null, 2)}

Gap analysis:

${JSON.stringify(gap, null, 2)}

Related patents:

${JSON.stringify(patents, null, 2)}

User question:

${question}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    });

    return response.text;
}


export async function generateCollaborationAnswer(
    question,
    research,
    opportunities
) {

    const prompt = `
You are a research assistant.

Identify potential research collaboration opportunities
from the provided information.

Use only the provided information.

Do not claim that organisations should definitely collaborate.

Describe them as potential opportunities based on
semantic similarity, shared mineral, different organisations,
and different technology areas.

Research:

${JSON.stringify(research, null, 2)}

Potential collaboration opportunities:

${JSON.stringify(opportunities, null, 2)}

User question:

${question}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    });

    return response.text;
}
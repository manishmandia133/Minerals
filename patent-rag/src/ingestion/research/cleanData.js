import { ai } from "../../ai/gemini.js";

export async function cleanData(rawData) {

    const prompt = `
You are a data normalization system for a research document database.

Convert the provided raw research information into a single structured JSON object.

The database schema is:

{
    "title": "string",
    "document_type": "string",
    "abstract": "string",
    "organisation": "string",
    "researchers": "string",
    "mineral": "string",
    "technology_area": "string",
    "source": "string",
    "publication_year": "number",
    "source_url": "string"
}

Rules:

- Return ONLY valid JSON.
- Do not return markdown.
- Do not add fields that are not in the schema.
- Keep information faithful to the provided raw data.
- Do not fabricate information.

The following fields are REQUIRED and must never be null:
- title
- abstract
- organisation
- mineral
- technology_area

Determine these fields from the provided raw data whenever the information is clearly available.

If any required field cannot be determined reliably from the raw data, return null for that field. The document will be rejected by the validation layer.

The following fields are OPTIONAL and may be null:
- document_type
- researchers
- source
- publication_year
- source_url

publication_year must be a number or null.

Preserve the original source URL if one is provided.

Normalize the information so that the same type of information is stored consistently across documents.

Raw research data:
${JSON.stringify(rawData, null, 2)}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    });

    let text = response.text.trim();

    text = text.replace(/^```json\s*/, "");
    text = text.replace(/\s*```$/, "");

    return JSON.parse(text);
}
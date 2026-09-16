import { ai } from "../../ai/gemini.js";

export async function cleanPatentData(rawData) {

    const prompt = `
You are a data normalization system for a patent database focused on
critical minerals, mineral processing, extraction, recycling, and related
technologies.

Convert the provided raw patent information into a single structured JSON
object.

The database schema is:

{
    "external_id": "string",
    "source": "string",
    "title": "string",
    "abstract": "string",
    "full_text": "string",
    "publication_number": "string",
    "publication_date": "string",
    "filing_date": "string",
    "applicants": "string",
    "inventors": "string",
    "organisation": "string",
    "mineral": "string",
    "technology_area": "string",
    "status": "string",
    "source_url": "string"
}

Rules:

- Return ONLY valid JSON.
- Do not return markdown or code fences.
- Do not add fields that are not in the schema.
- Keep information faithful to the provided raw data.
- Do not fabricate information.
- If a field cannot be determined reliably, return null.
- Preserve the original source URL if one is provided.
- Preserve patent numbers exactly as provided.
- Do not confuse the publication number with the external ID.
- Use ISO date format (YYYY-MM-DD) for publication_date and filing_date
  whenever the complete date is available.
- If only a year or an incomplete date is available, return null for that date.
- Store multiple applicants or inventors as a single comma-separated string.
- Use the organisation field for the primary applicant or institution,
  whenever it can be determined reliably.
- Keep mineral names and technology areas concise and consistent.
- Do not infer a mineral or technology area if it is not supported by the
  provided information.

Required fields for validation:

- title
- mineral
- technology_area

The following fields may be null:

- external_id
- source
- abstract
- full_text
- publication_number
- publication_date
- filing_date
- applicants
- inventors
- organisation
- status
- source_url

Raw patent data:
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
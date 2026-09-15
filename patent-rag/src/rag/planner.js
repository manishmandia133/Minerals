import { ai } from "../ai/gemini.js";

const databaseSchema = `
research_documents(
    id INTEGER,
    title TEXT,
    document_type VARCHAR,
    abstract TEXT,
    organisation TEXT,
    researchers TEXT,
    mineral VARCHAR,
    technology_area VARCHAR,
    source VARCHAR,
    publication_year INTEGER,
    source_url TEXT,
    embedding VECTOR(768)
)

patents(
    id INTEGER,
    external_id TEXT,
    source VARCHAR,
    title TEXT,
    abstract TEXT,
    full_text TEXT,
    publication_number TEXT,
    publication_date DATE,
    filing_date DATE,
    applicants TEXT,
    inventors TEXT,
    organisation TEXT,
    mineral TEXT,
    technology_area TEXT,
    status VARCHAR,
    source_url TEXT,
    embedding VECTOR(768)
)
`;

export async function planQuestion(question) {

  const prompt = `
You are a query planner for a research and patent database.

Choose the best method for answering the user's question.

METHODS:

SQL
Use for exact database operations:
- counts, totals, averages, grouping and trends
- filtering by metadata such as mineral, organisation, year or status
- retrieving specific records

RAG
Use for semantic understanding:
- explaining or comparing technologies
- summarizing research or patents
- understanding relationships based on document content
- questions where semantic similarity matters

GAP
Use for questions about potential patent gaps or limited patent coverage.

The system will:
- identify relevant research
- find patents in the same mineral domain
- compare semantic similarity
- classify coverage as NO_OBVIOUS_GAP, REVIEW_REQUIRED,
  POTENTIAL_GAP, or INSUFFICIENT_PATENT_COVERAGE

A potential gap is not proof that no patent exists.

COLLABORATION
Use for potential research collaboration opportunities.

The system looks for research that:
- concerns the same mineral
- comes from a different organisation
- has strong semantic similarity
- may use a different technology area

These are potential opportunities, not definite recommendations.


RESPONSE TYPE:

"text"     → normal conversational answer
"sources"  → supporting research/patents should be shown
"table"    → multiple structured records
"chart"    → counts, comparisons, distributions or trends

If response_type is "chart", chart_type must be:
"bar", "line", "pie", or "scatter".

Otherwise chart_type must be null.


DATABASE SCHEMA:

${databaseSchema}


OUTPUT:

Return ONLY valid JSON:

{
    "method": "sql | rag | gap | collaboration",
    "response_type": "text | sources | table | chart",
    "chart_type": "bar | line | pie | scatter | null",
    "query": "SQL query or null"
}

For SQL:
- query must be read-only
- return only the data required
- query may use either or both tables

For RAG, GAP and COLLABORATION:
- query must be null

Never generate:
INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE,
CREATE, GRANT or REVOKE.


EXAMPLES:

Question:
"How many patents are there for each mineral?"

{
    "method": "sql",
    "response_type": "chart",
    "chart_type": "bar",
    "query": "SELECT mineral, COUNT(*) AS patent_count FROM patents WHERE mineral IS NOT NULL GROUP BY mineral ORDER BY patent_count DESC;"
}

Question:
"Which approach is most promising for cobalt recovery?"

{
    "method": "rag",
    "response_type": "sources",
    "chart_type": null,
    "query": null
}

Question:
"What patent gaps exist around cobalt recovery?"

{
    "method": "gap",
    "response_type": "sources",
    "chart_type": null,
    "query": null
}

Question:
"Which organisations could potentially collaborate on cobalt recovery?"

{
    "method": "collaboration",
    "response_type": "sources",
    "chart_type": null,
    "query": null
}


USER QUESTION:

${question}
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
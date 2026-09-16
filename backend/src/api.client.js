import "dotenv/config";

const RESEARCH_API_URL = process.env.RESEARCH_API_URL;
const RAG_API_URL = process.env.RAG_API_URL;

export async function fetchResearch({ research, india_only, since }) {
    const response = await fetch(`${RESEARCH_API_URL}/fetch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            research,
            india_only,
            since
        })
    });

    if (!response.ok) {
        throw new Error(`RESEARCH API error: ${response.status}`);
    }

    return await response.json();
}

export async function getRecords() {
    const response = await fetch(
        `${RESEARCH_API_URL}/records?limit=40&sort=newest`
    );

    if (!response.ok) {
        throw new Error(`Mineral Intel API error: ${response.status}`);
    }

    return await response.json();
}

export async function recordsUploaded(documents) {
    const response = await fetch(
        `${RAG_API_URL}/api/v1/ingestion/research`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                documents
            })
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`RAG API error: ${response.status} - ${error}`);
    }

    return await response.json();
}

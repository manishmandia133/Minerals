import { pool } from "../db/db.js";

export async function retrieveDocuments(embedding) {
    const result = await pool.query(
        `
        SELECT
            id::TEXT AS id,
            'research'::TEXT AS document_type,
            title::TEXT,
            abstract::TEXT,
            organisation::TEXT,
            mineral::TEXT,
            technology_area::TEXT,
            1 - (embedding <=> $1::vector) AS similarity
        FROM research_documents
        WHERE embedding IS NOT NULL

        UNION ALL

        SELECT
            id::TEXT AS id,
            'patent'::TEXT AS document_type,
            title::TEXT,
            abstract::TEXT,
            organisation::TEXT,
            mineral::TEXT,
            technology_area::TEXT,
            1 - (embedding <=> $1::vector) AS similarity
        FROM patents
        WHERE embedding IS NOT NULL

        ORDER BY similarity DESC
        LIMIT 7;
        `,
        [`[${embedding.join(",")}]`]
    );

    return result.rows;
}

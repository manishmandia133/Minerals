import { pool } from "../../db/db.js";

export async function saveDocument(document) {

    const result = await pool.query(
        `
        INSERT INTO research_documents (
            title,
            document_type,
            abstract,
            organisation,
            researchers,
            mineral,
            technology_area,
            source,
            publication_year,
            source_url,
            embedding
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11::vector
        )
        RETURNING id;
        `,
        [
            document.title,
            document.document_type,
            document.abstract,
            document.organisation,
            document.researchers,
            document.mineral,
            document.technology_area,
            document.source,
            document.publication_year,
            document.source_url,
            `[${document.embedding.join(",")}]`
        ]
    );

    return result.rows[0];
}
import { pool } from "../../db/db.js";

export async function savePatent(patent) {

    const result = await pool.query(
        `
        INSERT INTO patents (
            external_id,
            source,
            title,
            abstract,
            full_text,
            publication_number,
            publication_date,
            filing_date,
            applicants,
            inventors,
            organisation,
            mineral,
            technology_area,
            status,
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
            $11,
            $12,
            $13,
            $14,
            $15,
            $16::vector
        )
        RETURNING id;
        `,
        [
            patent.external_id,
            patent.source,
            patent.title,
            patent.abstract,
            patent.full_text,
            patent.publication_number,
            patent.publication_date,
            patent.filing_date,
            patent.applicants,
            patent.inventors,
            patent.organisation,
            patent.mineral,
            patent.technology_area,
            patent.status,
            patent.source_url,
            `[${patent.embedding.join(",")}]`
        ]
    );

    return result.rows[0];
}
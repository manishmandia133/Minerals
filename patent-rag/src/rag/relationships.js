import { pool } from "../db/db.js";

export async function findRelatedPatents(researchId) {

    const result = await pool.query(
        `
        SELECT
            p.id,
            p.title,
            p.abstract,
            p.organisation,
            p.mineral,
            p.technology_area,

            1 - (p.embedding <=> r.embedding) AS similarity,

            CASE
                WHEN LOWER(p.mineral) = LOWER(r.mineral)
                THEN true
                ELSE false
            END AS same_mineral,

            CASE
                WHEN LOWER(p.organisation) = LOWER(r.organisation)
                THEN true
                ELSE false
            END AS same_organisation,

            CASE
                WHEN LOWER(p.technology_area) = LOWER(r.technology_area)
                THEN true
                ELSE false
            END AS same_technology

        FROM patents p
        CROSS JOIN research_documents r

        WHERE r.id = $1
          AND p.embedding IS NOT NULL

        ORDER BY p.embedding <=> r.embedding

        LIMIT 7;
        `,
        [researchId]
    );

    return result.rows;
}
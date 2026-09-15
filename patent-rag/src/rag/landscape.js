import { pool } from "../db/db.js";

export async function findPatentLandscape(researchId) {

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
                WHEN LOWER(COALESCE(p.mineral, '')) =
                     LOWER(COALESCE(r.mineral, ''))
                THEN true
                ELSE false
            END AS same_mineral,

            CASE
                WHEN LOWER(COALESCE(p.organisation, '')) =
                     LOWER(COALESCE(r.organisation, ''))
                THEN true
                ELSE false
            END AS same_organisation,

            CASE
                WHEN LOWER(COALESCE(p.technology_area, '')) =
                     LOWER(COALESCE(r.technology_area, ''))
                THEN true
                ELSE false
            END AS same_technology

        FROM patents p
        CROSS JOIN research_documents r

        WHERE r.id = $1
          AND p.embedding IS NOT NULL
          AND LOWER(COALESCE(p.mineral, '')) =
              LOWER(COALESCE(r.mineral, ''))

        ORDER BY p.embedding <=> r.embedding

        LIMIT 10;
        `,
        [researchId]
    );

    return result.rows;
}
import { pool } from "../db/db.js";

export async function findCollaborationOpportunities(researchId) {

    const result = await pool.query(
        `
        SELECT
            r2.id,
            r2.title,
            r2.organisation,
            r2.mineral,
            r2.technology_area,

            1 - (r2.embedding <=> r1.embedding) AS similarity,

            CASE
                WHEN LOWER(COALESCE(r2.technology_area, '')) =
                     LOWER(COALESCE(r1.technology_area, ''))
                THEN false
                ELSE true
            END AS different_technology

        FROM research_documents r1
        CROSS JOIN research_documents r2

        WHERE r1.id = $1
          AND r2.id != r1.id

          AND r2.embedding IS NOT NULL

          AND LOWER(COALESCE(r2.mineral, '')) =
              LOWER(COALESCE(r1.mineral, ''))

          AND LOWER(COALESCE(r2.organisation, '')) !=
              LOWER(COALESCE(r1.organisation, ''))

        ORDER BY r2.embedding <=> r1.embedding

        LIMIT 5;
        `,
        [researchId]
    );

    return result.rows.filter(
        row => Number(row.similarity) >= 0.60
    );
}
import { createEmbedding } from "../ai/embeddings.js";

import { planQuestion } from "./planner.js";

import { retrieveDocuments } from "./retrieve.js";

import { buildContext } from "./context.js";

import {
    generateAnswer,
    generateSqlAnswer,
    generateGapAnswer,
    generateCollaborationAnswer
} from "./answer.js";

import { pool } from "../db/db.js";

import { resolveQuestion } from "./conversation.js";

import { findPatentLandscape } from "./landscape.js";

import { detectPatentGap } from "./gapDetection.js";

import {
    findCollaborationOpportunities
} from "./collaboration.js";


export async function answerQuestion(question, history = []) {

    const resolvedQuestion = await resolveQuestion(
        question,
        history
    );

    const plan = await planQuestion(
        resolvedQuestion
    );


    if (plan.method === "sql") {

        const result = await pool.query(
            plan.query
        );

        const answer = await generateSqlAnswer(
            resolvedQuestion,
            result.rows
        );

        return {
            answer,
            sources: result.rows,
            resolvedQuestion,
            response_type: plan.response_type,
            chart_type: plan.chart_type
        };
    }


    if (plan.method === "rag") {

        const embedding = await createEmbedding(
            resolvedQuestion
        );

        const documents = await retrieveDocuments(
            embedding
        );

        const context = buildContext(
            documents
        );

        const answer = await generateAnswer(
            resolvedQuestion,
            context
        );

        return {
            answer,
            sources: documents,
            resolvedQuestion,
            response_type: plan.response_type,
            chart_type: plan.chart_type
        };
    }


    if (plan.method === "gap") {

        const embedding = await createEmbedding(
            resolvedQuestion
        );

        const documents = await retrieveDocuments(
            embedding
        );

        const researchDocuments = documents.filter(
            doc => doc.document_type === "research"
        );

        if (researchDocuments.length === 0) {
            throw new Error(
                "No relevant research document found"
            );
        }

        const research = researchDocuments[0];

        const patents = await findPatentLandscape(
            research.id
        );

        const gap = detectPatentGap(
            patents
        );

        const answer = await generateGapAnswer(
            resolvedQuestion,
            research,
            gap,
            patents
        );

        return {
            answer,
            research,
            patents,
            gap,
            resolvedQuestion,
            response_type: plan.response_type,
            chart_type: plan.chart_type
        };
    }


    if (plan.method === "collaboration") {

        const embedding = await createEmbedding(
            resolvedQuestion
        );

        const documents = await retrieveDocuments(
            embedding
        );

        const researchDocuments = documents.filter(
            doc => doc.document_type === "research"
        );

        if (researchDocuments.length === 0) {
            throw new Error(
                "No relevant research document found"
            );
        }

        const research = researchDocuments[0];

        const opportunities = await findCollaborationOpportunities(
            research.id
        );

        const answer = await generateCollaborationAnswer(
            resolvedQuestion,
            research,
            opportunities
        );

        return {
            answer,
            research,
            opportunities,
            resolvedQuestion,
            response_type: plan.response_type,
            chart_type: plan.chart_type
        };
    }


    throw new Error(
        `Unknown planning method: ${plan.method}`
    );
}
import { cleanData } from "./research/cleanData.js";
import { validateData } from "./research/validateData.js";
import { createDocument } from "./research/createDocument.js";
import { saveDocument } from "./research/saveDocument.js";

import { validatePatent } from "./patents/validatePatent.js";
import { createPatent } from "./patents/createPatent.js";
import { savePatent } from "./patents/savePatent.js";


export async function ingestResearch(documents) {

    const successful = [];
    const failed = [];

    for (let i = 0; i < documents.length; i++) {

        try {

            const cleanedData =
                await cleanData(documents[i]);

            const validatedData =
                validateData(cleanedData);

            const documentWithEmbedding =
                await createDocument(validatedData);

            const savedDocument =
                await saveDocument(documentWithEmbedding);

            successful.push({
                index: i,
                ...savedDocument
            });

        } catch (error) {

            failed.push({
                index: i,
                reason: error.message
            });
        }
    }

    return {
        successful,
        failed
    };
}


export async function ingestPatents(patents) {

    const successful = [];
    const failed = [];

    for (let i = 0; i < patents.length; i++) {

        try {

            const validatedPatent =
                validatePatent(patents[i]);

            const patentWithEmbedding =
                await createPatent(validatedPatent);

            const savedPatent =
                await savePatent(patentWithEmbedding);

            successful.push({
                index: i,
                ...savedPatent
            });

        } catch (error) {

            failed.push({
                index: i,
                reason: error.message
            });
        }
    }

    return {
        successful,
        failed
    };
}
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

import {
    ingestResearch,
    ingestPatents
} from "../../ingestion/ingestionService.js";


const processResult = (results, res) => {

    let statusCode = 201;
    let message = "Documents processed successfully";

    if (
        results.failed.length > 0 &&
        results.successful.length > 0
    ) {
        statusCode = 207;
        message = "Documents processed with some failures";

    } else if (results.failed.length > 0) {

        statusCode = 400;
        message = "All documents failed";
    }

    return res
        .status(statusCode)
        .json(
            new ApiResponse(
                statusCode,
                results,
                message
            )
        );
};


const ingestResearchDocuments = asyncHandler(async (req, res) => {

    const { documents } = req.body;

    if (!documents || !Array.isArray(documents)) {
        throw new ApiError(
            400,
            "Documents must be provided as an array"
        );
    }

    if (documents.length === 0) {
        throw new ApiError(
            400,
            "Documents array cannot be empty"
        );
    }

    const results = await ingestResearch(documents);

    return processResult(results, res);
});


const ingestPatentDocuments = asyncHandler(async (req, res) => {

    const { patents } = req.body;

    if (!patents || !Array.isArray(patents)) {
        throw new ApiError(
            400,
            "Patents must be provided as an array"
        );
    }

    if (patents.length === 0) {
        throw new ApiError(
            400,
            "Patents array cannot be empty"
        );
    }

    const results = await ingestPatents(patents);

    return processResult(results, res);
});


export {
    ingestResearchDocuments,
    ingestPatentDocuments
};
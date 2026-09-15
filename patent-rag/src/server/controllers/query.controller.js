import { answerQuestion } from "../../rag/ragService.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const query = asyncHandler(async (req, res) => {

    const { question, history = [] } = req.body;

    if (!question || typeof question !== "string" || question.trim() === "") {
        throw new ApiError(
            400,
            "Question is required"
        );
    }

    if (!Array.isArray(history)) {
        throw new ApiError(
            400,
            "History must be an array"
        );
    }

    const result = await answerQuestion(
        question.trim(),
        history
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "Question answered successfully"
            )
        );
});

export { query };
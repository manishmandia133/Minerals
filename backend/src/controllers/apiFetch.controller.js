import {
    fetchResearch,
    getRecords,
    recordsUploaded
} from "../api.client.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export async function researchFetch(req, res) {
    const { research, since } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const fetchResult = await fetchResearch({
        research,
        india_only: true,
        since,
    });

    const records = await getRecords();

    const recordsWithAbstract = records.records.filter(record => record.abstract);

    if (!fetchResult.status === "success") {
        return res.status(500).json(new ApiResponse("error", "Failed to fetch research data"));
    }

    const documents = recordsWithAbstract.map(record => ({
        raw_data: Object.entries(record)
            .map(([key, value]) => {
                return `${key}: ${value === null || value === undefined
                    ? "null"
                    : Array.isArray(value)
                        ? value.join(", ")
                        : value
                    }`;
            })
            .join("\n")
    }));

    const ragResult = await recordsUploaded(documents);

    if (!ragResult.success) {
        return res.status(500).json(new ApiResponse("error", "Failed to upload records to RAG API"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Research data fetched and uploaded successfully"));
}
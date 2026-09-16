import {
    fetchResearch,
    getRecords,
    recordsUploaded,
    fetchPatent,
    getPatent,
    patentsUploaded,
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
    console.log("Total records:", records.records?.length);

    const recordsWithAbstract = records.records.filter(record => record.abstract);
    console.log("Abstract:", recordsWithAbstract.length);
    if (!fetchResult.status === "success") {
        return res.status(500).json(new ApiResponse("error", "Failed to fetch research data"));
    }
    console.log("recordsResponse:", records);
    console.log("Total records:", records.records?.length);
    console.log("Records with abstracts:", recordsWithAbstract.length);

    if (recordsWithAbstract.length === 0) {
        return res.status(200).json(new ApiResponse(200, "No records with abstracts found"));
    }

    const documents = recordsWithAbstract.map(record => ({
        raw_data: Object.entries(record)
            .slice(0, 15)
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

export async function patentFetch(req, res) {
    let { patents, patent_pages } = req.body;

    const fetchResult = await fetchPatent({
        patents,
        india_only: true,
        patent_pages
    });

    const records = await getPatent();
    console.log("Total records:", records.records?.length);

    const recordsWithAbstract = records.records.filter(record => record.abstract);
    console.log("Abstract:", recordsWithAbstract.length);
    if (!fetchResult.status === "success") {
        return res.status(500).json(new ApiResponse("error", "Failed to fetch patent data"));
    }
    // console.log("recordsResponse:", records);
    console.log("Total records:", records.records?.length);
    console.log("Records with abstracts:", recordsWithAbstract.length);

    if (recordsWithAbstract.length === 0) {
        return res.status(200).json(new ApiResponse(200, "No records with abstracts found"));
    }

    patents = recordsWithAbstract.map(record => ({
        raw_data: Object.entries(record)
            .slice(0, 15)
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

    const ragResult = await patentsUploaded(patents);

    if (!ragResult.success) {
        return res.status(500).json(new ApiResponse("error", "Failed to upload patents to RAG API"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Patent data fetched and uploaded successfully"));
}
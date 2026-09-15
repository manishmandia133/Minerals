const allowedFields = [
    "external_id",
    "source",
    "title",
    "abstract",
    "full_text",
    "publication_number",
    "publication_date",
    "filing_date",
    "applicants",
    "inventors",
    "organisation",
    "mineral",
    "technology_area",
    "status",
    "source_url"
];

export function validatePatent(data) {

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Invalid patent data");
    }

    const extraFields = Object.keys(data).filter(
        field => !allowedFields.includes(field)
    );

    if (extraFields.length > 0) {
        throw new Error(
            `Unexpected fields: ${extraFields.join(", ")}`
        );
    }

    if (
        !data.title ||
        typeof data.title !== "string" ||
        !data.title.trim()
    ) {
        throw new Error("Title is required");
    }

    if (
        data.abstract !== null &&
        data.abstract !== undefined &&
        typeof data.abstract !== "string"
    ) {
        throw new Error("Abstract must be a string or null");
    }

    if (
        !data.mineral ||
        typeof data.mineral !== "string" ||
        !data.mineral.trim()
    ) {
        throw new Error("Mineral is required");
    }

    if (
        !data.technology_area ||
        typeof data.technology_area !== "string" ||
        !data.technology_area.trim()
    ) {
        throw new Error("Technology area is required");
    }

    return data;
}
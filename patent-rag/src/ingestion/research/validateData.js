const allowedFields = [
    "title",
    "document_type",
    "abstract",
    "organisation",
    "researchers",
    "mineral",
    "technology_area",
    "source",
    "publication_year",
    "source_url"
];

export function validateData(data) {

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Invalid document data");
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
        !data.abstract ||
        typeof data.abstract !== "string" ||
        !data.abstract.trim()
    ) {
        throw new Error("Abstract is required");
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

    if (
        data.publication_year !== null &&
        data.publication_year !== undefined &&
        typeof data.publication_year !== "number"
    ) {
        throw new Error("publication_year must be a number or null");
    }

    return data;
}
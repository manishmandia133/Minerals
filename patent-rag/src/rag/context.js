export function buildContext(documents) {

    return documents
        .map((doc, index) => {

            return `
Document ${index + 1}:
Type: ${doc.document_type}
Title: ${doc.title}
Organisation: ${doc.organisation}
Mineral: ${doc.mineral}
Technology Area: ${doc.technology_area}
Abstract: ${doc.abstract}
`;
        })
        .join("\n");
}
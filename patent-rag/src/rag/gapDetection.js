export function detectPatentGap(patents) {

    if (patents.length === 0) {
        return {
            status: "INSUFFICIENT_PATENT_COVERAGE",
            message:
                "No patents were found in the same mineral domain.",
            patents_checked: 0
        };
    }

    const closestPatent = patents[0];
    const similarity = Number(closestPatent.similarity);

    let status;

    if (similarity >= 0.80) {
        status = "NO_OBVIOUS_GAP";
    } else if (similarity >= 0.60) {
        status = "REVIEW_REQUIRED";
    } else {
        status = "POTENTIAL_GAP";
    }

    return {
        status,
        closest_patent_similarity: similarity,
        closest_patent: {
            id: closestPatent.id,
            title: closestPatent.title,
            organisation: closestPatent.organisation
        },
        patents_checked: patents.length
    };
}
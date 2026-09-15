import { Router } from "express";

import {
    ingestResearchDocuments,
    ingestPatentDocuments
} from "../controllers/ingestion.controller.js";

const router = Router();

router.post("/research", ingestResearchDocuments);

router.post("/patents", ingestPatentDocuments);

export default router;
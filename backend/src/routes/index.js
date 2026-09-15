import { Router } from 'express';
import {
	getAllPatents,
	getPatentsByMineral,
	getPatentsByYear,
} from '../controllers/patentController.js';
import {
	getAllResearches,
	getResearchesByMineral,
	getResearchesByYear,
} from '../controllers/researchController.js';

const router = Router();

router.get('/patents', getAllPatents);
router.get('/patents/mineral/:mineral', getPatentsByMineral);
router.get('/patents/year/:year', getPatentsByYear);
router.get('/researches', getAllResearches);
router.get('/researches/mineral/:mineral', getResearchesByMineral);
router.get('/researches/year/:year', getResearchesByYear);

export default router;

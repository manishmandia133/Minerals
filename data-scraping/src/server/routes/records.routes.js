'use strict';
const { Router } = require('express');
const { listRecords, getRecord, getHealth, landing } = require('../controllers/records.controller');

const router = Router();
router.get('/records', listRecords);
router.get('/records/:id', getRecord);
router.get('/health', getHealth);
router.get('/', landing);

module.exports = router;

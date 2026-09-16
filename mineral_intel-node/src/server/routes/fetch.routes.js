'use strict';
const { Router } = require('express');
const { fetchHandler } = require('../controllers/fetch.controller');

const router = Router();
router.post('/fetch', fetchHandler);
router.post('/ingest', fetchHandler); // alias

module.exports = router;

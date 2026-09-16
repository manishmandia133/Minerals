'use strict';
// Express app wiring. Routes live in ./routes, logic in ./controllers.
const express = require('express');
const { reconcileFilenames } = require('../services/store.service');

function createApp() {
  const app = express();
  app.use(express.json());
  reconcileFilenames(); // heal old filenames on startup

  app.use('/', require('./routes/fetch.routes'));
  app.use('/', require('./routes/records.routes'));
  app.get('/favicon.ico', (req, res) => res.status(204).end());
  app.use((req, res) => res.status(404).json({ detail: 'Not found.' }));

  return app;
}

module.exports = { createApp };

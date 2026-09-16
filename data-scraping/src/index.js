'use strict';
const { createApp } = require('./server/app');
const { PORT } = require('./config');

createApp().listen(PORT, () => console.log(`mineral-intel listening on http://localhost:${PORT}`));

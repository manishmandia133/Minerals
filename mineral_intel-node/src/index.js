'use strict';
const { createApp } = require('./server');
const port = parseInt(process.env.PORT || '8000', 10);
createApp().listen(port, () => console.log(`mineral-intel listening on http://localhost:${port}`));

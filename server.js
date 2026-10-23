const express = require('express');
const path = require('path');

function startServer() {
  return new Promise((resolve, reject) => {
    const web = express();
    web.use(express.static(__dirname));
    const server = web.listen(0, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}
module.exports = { startServer };

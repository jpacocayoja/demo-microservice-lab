require('dotenv').config();
const Server = require('./server');

const server = new Server();

// Solo exportamos la app, NO iniciamos el servidor
module.exports = server.app;
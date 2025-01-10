const connectDB = require('./src/config/database/dbConnection');
const express = require('./app');
const color = require('colors');

require('dotenv').config();
const app = express();
const server = require('http').createServer(app);

connectDB();
const PORT = process.env.PORT || 1200;

server.listen(PORT, function () {
  console.log(
    '_________________________________________________________________________________'
  );
  console.log(
    '|' +
      color.green.bold(
        ` $Server is running on: | http://localhost:${PORT} |                              `
      ) +
      '|'
  );
});

const express = require('express');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: '.env' });
const errorHandler = require('./src/app/common/helpers/error.middleware');
const v1Route = require('./loaders/route');
const helmet = require('helmet');
const { sendResponse } = require('./src/app/common/helpers/responseHandler');
const {
  successResponseCode,
} = require('./src/app/common/helpers/responseCode');
const { client } = require('./src/app/common/utils/redis');
const color = require('colors');

module.exports = () => {
  const app = express();
  app.set('trust proxy', true);

  client.connect();
  client.on('error', (err) => {
    console.log(`Error in redis ${err}`);
    client.quit();
  });
  client.on('connect', function (error) {
    if (!error) {
      console.log(
        '|' +
          color.green.bold(
            ` $Redis connected successfully!                                `
          ) +
          '                |' +
          ''
      );
      console.log(
        '---------------------------------------------------------------------------------'
      );
    } else {
      console.log(`error in redis cconnection ${error}`);
    }
  });

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
      sendResponse(
        res,
        false,
        null,
        'Too many requests, please try again later.'
      );
    },
  });

  app.use(limiter);

  app.use(helmet());
  app.use(express.static('./app'));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use('/', v1Route);
  app.use(errorHandler);

  const PORT = process.env.PORT;
  app.get('/', (req, res) => {
    sendResponse(
      res,
      successResponseCode.OK,
      true,
      null,
      `Hello ${req.ip}, Server is running on Port -${PORT} `
    );
  });
  return app;
};

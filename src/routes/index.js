const express = require('express');

const config = require('../config/config');
const v1Routes = require('./v1');

const router = express.Router();

router.use('/v1', v1Routes);

// mount api routes
router.get('/', (req, res) =>
  res.send({
    message: `Welcome to ${config.appName}`,
    version: config.version,
    status: 'OK'
  })
);

module.exports = router;

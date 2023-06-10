/*
  IMPORTANT!
  This route is a proof of concept.
  In real-life application, parties may have their own API endpoints in anywhere they chose.
  This route is just a mockup to show how the APIs must be served.
*/

const express = require('express');

const router = express.Router();

const findGetController = require('../controllers/api/find/get');
const oppositionGetController = require('../controllers/api/opposition/get');
const stateGetController = require('../controllers/api/state/get');

router.get(
  '/find',
    findGetController
);
router.get(
  '/opposition',
    oppositionGetController
);
router.get(
  '/state',
    stateGetController
);

module.exports = router;

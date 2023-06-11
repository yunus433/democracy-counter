const express = require('express');

const router = express.Router();

const indexGetController = require('../controllers/data/get');

router.get(
  '/',
    indexGetController
);

module.exports = router;

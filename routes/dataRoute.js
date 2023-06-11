const express = require('express');

const router = express.Router();

const indexGetController = require('../controllers/data/get');

const indexPostController = require('../controllers/data/post');

router.get(
  '/',
    indexGetController
);

router.post(
  '/',
    indexPostController
);

module.exports = router;

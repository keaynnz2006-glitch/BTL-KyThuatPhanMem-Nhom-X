const express = require('express');
const playController = require('../controllers/play.controller');

const router = express.Router();

router.post('/', playController.playTurn);

module.exports = router;
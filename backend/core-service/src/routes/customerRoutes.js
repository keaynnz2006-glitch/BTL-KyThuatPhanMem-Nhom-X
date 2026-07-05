const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/exchangeController'); 

router.post('/tickets/create', exchangeController.createTicket);

module.exports = router;
const express = require('express');
const stockController = require('../controllers/stock.controller');

const router = express.Router();

router.get('/', stockController.getToys);
router.put('/:id', stockController.updateToyQuantity);

module.exports = router;
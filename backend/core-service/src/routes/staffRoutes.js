const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Route lấy danh sách và route duyệt phiếu
router.get('/tickets', staffController.getAllTickets);
router.post('/approve/:id', staffController.approveTicket);

module.exports = router;
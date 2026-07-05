const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Tuyến đường lấy danh sách phiếu
router.get('/tickets', staffController.getAllTickets);

// Tuyến đường Duyệt phiếu (Dùng :id khớp với controller của bro)
router.post('/approve/:id', staffController.approveTicket);

// Tuyến đường Hủy phiếu (Xóa hẳn phiếu khỏi DB)
router.delete('/tickets/reject/:id', staffController.rejectTicket);

module.exports = router;
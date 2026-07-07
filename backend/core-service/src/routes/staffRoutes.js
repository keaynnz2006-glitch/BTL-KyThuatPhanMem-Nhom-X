const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Tuyến đường lấy danh sách phiếu
router.get('/tickets', staffController.getAllTickets);

// Tuyến đường Duyệt phiếu (Dùng :id khớp với controller của bro)
router.post('/approve/:id', staffController.approveTicket);

// Tuyến đường Hủy phiếu (Xóa hẳn phiếu khỏi DB)
router.delete('/tickets/reject/:id', staffController.rejectTicket);

// Tuyến đường lấy danh sách máy, gấu và xử lý nạp gấu vào máy
router.get('/machines', staffController.getAllMachines);
router.get('/bears', staffController.getAllBears);
router.post('/bears/replenish', staffController.replenishBearToMachine);

// Tuyến đường lấy kho thực tế của các máy
router.get('/machines-inventory', staffController.getMachinesInventory);

// Tuyến đường cho nhân viên xóa hẳn gấu khỏi máy gắp
router.delete('/machines/remove-toy', staffController.removeToyFromMachine);

module.exports = router;
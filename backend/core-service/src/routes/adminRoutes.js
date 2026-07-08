const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const jwt = require('jsonwebtoken');


const JWT_SECRET = 'sieu-bao-mat-btl-2026';


const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ chuỗi "Bearer <token>"

    if (!token) {
        return res.status(401).json({ success: false, message: 'Bro phải đăng nhập trước đã nhé!' });
    }

    try {
      
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next(); 
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token lậu hoặc hết hạn rồi bro ơi!' });
    }
};




router.get('/stats', verifyToken, adminController.getDashboardStats);


router.get('/toys', verifyToken, adminController.getAllToys);
router.post('/toys/add', verifyToken, adminController.addToy);
router.delete('/toys/delete/:id', verifyToken, adminController.deleteToy); 


router.get('/revenue-report', verifyToken, adminController.getRevenueReport);

router.put('/update-role', verifyToken, adminController.updateUserRole);
//
router.get('/users', verifyToken, adminController.getAllUsers);
module.exports = router;
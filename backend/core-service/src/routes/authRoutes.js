const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Routes Đăng nhập / Đăng ký
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Routes Quản lý tài khoản và số dư xu
router.get('/user/balance', userController.getBalance);
router.post('/user/recharge', userController.recharge);
router.post('/user/deduct-coins', userController.deductCoins);


router.post('/user/history', userController.createHistory);
router.get('/user/history', userController.getPlayHistory); 


router.get('/machines/quantities', userController.getMachineQuantities);
module.exports = router;
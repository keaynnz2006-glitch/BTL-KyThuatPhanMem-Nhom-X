const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.get('/stats', adminController.getDashboardStats);


router.get('/toys', adminController.getAllToys);
router.post('/toys/add', adminController.addToy);
router.delete('/toys/delete/:id', adminController.deleteToy); 
router.get('/revenue-report', adminController.getRevenueReport);
module.exports = router;
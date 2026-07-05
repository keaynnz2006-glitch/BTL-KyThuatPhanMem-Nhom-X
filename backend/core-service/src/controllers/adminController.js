const AdminModel = require('../models/adminModel');

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await AdminModel.getStats();
        const recentOrders = await AdminModel.getRecentOrders();

        return res.status(200).json({
            success: true,
            stats,
            recentOrders
        });
    } catch (error) {
        console.error("❌ Lỗi lấy số liệu Dashboard Admin:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống không lấy được số liệu!' });
    }
};
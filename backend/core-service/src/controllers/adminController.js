const AdminModel = require('../models/adminModel');

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await AdminModel.getStats();
        const recentOrders = await AdminModel.getRecentOrders();
        return res.status(200).json({ success: true, stats, recentOrders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllToys = async (req, res) => {
    try {
        const toys = await AdminModel.getAllToys();
        return res.status(200).json({ success: true, toys });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


exports.addToy = async (req, res) => {
    const { ten_gau, gia_tri_diem, so_luong_kho, hinh_anh } = req.body;
    try {
        const validationPoint = parseInt(gia_tri_diem) || 0;
        const validationQty = parseInt(so_luong_kho) || 0;

        const newId = await AdminModel.addToy(
            ten_gau, 
            validationPoint, 
            validationQty, 
            hinh_anh || 'default.png'
        );
        return res.status(201).json({ success: true, message: "Thêm gấu vào kho thành công!", id: newId });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteToy = async (req, res) => {
    const { id } = req.params;
    try {
        await AdminModel.deleteToy(id);
        return res.status(200).json({ success: true, message: "Đã xóa gấu khỏi kho thành công!" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


exports.getRevenueReport = async (req, res) => {
    const { type } = req.query; // Nhận lên từ route dạng: ?type=day hoặc ?type=month...
    
    // Kiểm tra tính hợp lệ của tham số truyền lên
    if (!['day', 'month', 'year'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Bộ lọc thời gian không hợp lệ bro ơi!' });
    }

    try {
        // Gọi hàm từ adminModel chúng ta đã chuẩn hóa
        const data = await AdminModel.getRevenueByTimeline(type);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
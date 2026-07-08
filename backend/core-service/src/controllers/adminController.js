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


exports.updateUserRole = async (req, res) => {
    
    if (!req.user || req.user.vai_tro !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Bro không có quyền thực hiện hành động này!' });
    }

    const { target_user_id, new_role } = req.body;

    // Kiểm tra tính hợp lệ của vai trò mới theo cấu trúc bảng cơ sở dữ liệu
    if (!['Admin', 'NhanVien', 'KhachHang'].includes(new_role)) {
        return res.status(400).json({ success: false, message: 'Vai trò mới không hợp lệ bro ơi!' });
    }

    try {
        // Gọi hàm xử lý từ AdminModel để tương tác xuống DB
        const affectedRows = await AdminModel.updateUserRole(target_user_id, new_role);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản yêu cầu!' });
        }

        return res.status(200).json({ success: true, message: ` Đã đổi vai trò tài khoản sang [${new_role}] thành công!` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

//
exports.getAllUsers = async (req, res) => {
    try {
        if (!req.user || req.user.vai_tro !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Bro không phải Admin nha!' });
        }
        const users = await AdminModel.getAllUsers();
        return res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
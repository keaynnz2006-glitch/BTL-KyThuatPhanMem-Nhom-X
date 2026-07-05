const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = 'sieu-bao-mat-btl-2026';

exports.register = async (req, res) => {
    const { tai_khoan, mat_khau, ho_ten, vai_tro } = req.body;
    if (!tai_khoan || !mat_khau || !ho_ten) {
        return res.status(400).json({ error: 'Vui lòng điền đủ thông tin nha!' });
    }

    try {
        const existing = await UserModel.findByUsername(tai_khoan);
        if (existing) return res.status(400).json({ error: 'Tài khoản này đã tồn tại rồi bro!' });

        // Mặc định nếu không truyền vai_tro thì lưu là KhachHang
        const roleSave = vai_tro || 'KhachHang';

        // 🔥 Lưu THẲNG mật khẩu chữ thường (mat_khau) vào DB, không băm bủng gì hết
        await UserModel.create(tai_khoan, mat_khau, ho_ten, roleSave);
        res.status(201).json({ success: true, message: '🎉 Đăng ký tài khoản thành công!' });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

exports.login = async (req, res) => {
    const { tai_khoan, mat_khau } = req.body;

    try {
        const user = await UserModel.findByUsername(tai_khoan);
        if (!user) return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác!' });

        //  So sánh CHỮ THƯỜNG trực tiếp bằng toán tử !==
        if (mat_khau !== user.mat_khau) {
            return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác!' });
        }

        // Ký sinh JWT Token chứa thông tin vai trò để phân quyền
        const token = jwt.sign({ id: user.id, vai_tro: user.vai_tro }, JWT_SECRET, { expiresIn: '1d' });
        
        // Trả thêm trường vai_tro về để login.html đọc được 
        res.json({ 
            success: true, 
            token, 
            userId: user.id, 
            vai_tro: user.vai_tro 
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};
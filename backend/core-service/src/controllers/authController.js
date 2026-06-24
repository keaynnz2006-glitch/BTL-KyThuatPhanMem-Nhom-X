const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = 'sieu-bao-mat-btl-2026';

exports.register = async (req, res) => {
    const { tai_khoan, mat_khau, ho_ten, vai_tro } = req.body;
    if (!tai_khoan || !mat_khau || !ho_ten) {
        return res.status(400).json({ error: 'Bro vui lòng điền đủ thông tin nha!' });
    }

    try {
        const existing = await UserModel.findByUsername(tai_khoan);
        if (existing) return res.status(400).json({ error: 'Tài khoản này đã tồn tại rồi bro!' });

        // Băm mật khẩu bằng Bcrypt theo đúng Task Description
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mat_khau, salt);

        await UserModel.create(tai_khoan, hashedPassword, ho_ten, vai_tro);
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

        // So sánh mật khẩu truyền vào với mật khẩu đã băm trong DB
        const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
        if (!isMatch) return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác!' });

        // Ký sinh JWT Token chứa thông tin vai trò để phân quyền
        const token = jwt.sign({ id: user.id, vai_tro: user.vai_tro }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, token, userId: user.id });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};
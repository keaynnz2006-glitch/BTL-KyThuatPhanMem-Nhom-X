const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = 'sieu-bao-mat-btl-2026';

exports.register = async (req, res) => {
   
    const { tai_khoan, mat_khau, ho_ten, vai_tro, so_dien_thoai } = req.body;
 
    if (!tai_khoan || !mat_khau || !ho_ten || !so_dien_thoai) {
        return res.status(400).json({ error: 'Vui lòng điền đủ thông tin, kể cả Số điện thoại nha!' });
    }

    try {
        const existing = await UserModel.findByUsername(tai_khoan);
        if (existing) return res.status(400).json({ error: 'Tài khoản này đã tồn tại rồi bro!' });

     
        const roleSave = vai_tro || 'KhachHang';

      
        await UserModel.create(tai_khoan, mat_khau, ho_ten, roleSave, so_dien_thoai);
        
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

   
        if (mat_khau !== user.mat_khau) {
            return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác!' });
        }

        
        const token = jwt.sign({ id: user.id, vai_tro: user.vai_tro }, JWT_SECRET, { expiresIn: '1d' });
        
        
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
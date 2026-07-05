const UserModel = require('../models/userModel');
const { CoinContext } = require('../strategies/coinPromotion');
const jwt = require('jsonwebtoken');


const db = require('../config/database'); 

const JWT_SECRET = 'sieu-bao-mat-btl-2026';


// 1. LẤY SỐ DƯ TÀI KHOẢN

exports.getBalance = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Không tìm thấy Token bảo mật!' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserModel.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại!' });
        
        res.json({ success: true, fullName: user.ho_ten, coins: user.so_du_xu });
    } catch (err) { 
        res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn!' }); 
    }
};




exports.recharge = async (req, res) => {
    const { userId, amountVnd } = req.body;
    if (!userId || !amountVnd) return res.status(400).json({ error: 'Thiếu thông tin số tiền nạp!' });

    try {
        const context = new CoinContext();
        context.setStrategyByDate(); 
        const exactCoins = context.executeStrategy(amountVnd);

        
        await UserModel.updateBalance(userId, exactCoins);

      
        const queryInvoice = `
            INSERT INTO hoadonnapxu (id_khach_hang, so_tien_vnd, so_xu_nhan, phuong_thuc, trang_thai) 
            VALUES (?, ?, ?, 'Chuyển khoản', 'Thành công')
        `;
        const [result] = await db.query(queryInvoice, [userId, amountVnd, exactCoins]);


        const maDonVuaTao = result.insertId;


        res.json({ 
            success: true, 
            message: `Nạp tiền thành công! Bạn được cộng ${exactCoins} xu vào tài khoản.`,
            ma_don: maDonVuaTao 
        });

    } catch (err) { 
        console.error(" Lỗi khi xử lý nạp tiền & hóa đơn:", err.message);
        res.status(500).json({ error: err.message }); 
    }
};




exports.deductCoins = async (req, res) => { 
    const { coinsToDeduct } = req.body;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Không tìm thấy Token bảo mật!' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserModel.findById(decoded.id);
        if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại!' });

        const currentCoins = parseInt(user.so_du_xu || 0);
        const deductAmount = parseInt(coinsToDeduct);

        if (currentCoins < deductAmount) {
            return res.status(400).json({ success: false, message: "Tài khoản của bro không đủ xu để chơi!" });
        }

        const coinsChange = -deductAmount; 
        await UserModel.updateBalance(decoded.id, coinsChange);

        return res.status(200).json({ 
            success: true, 
            message: "Trừ xu thành công", 
            newCoins: currentCoins - deductAmount 
        });

    } catch (error) {
        console.error("Lỗi trừ xu tại Core-Service:", error);
        return res.status(403).json({ success: false, message: "Token không hợp lệ hoặc lỗi hệ thống ví tiền!" });
    }
};




exports.createHistory = async (req, res) => {
    const { machineId, toyId } = req.body;
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Thiếu token xác thực!' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
  
        await UserModel.savePlayHistory(decoded.id, machineId, toyId);

        return res.status(201).json({ success: true, message: 'Đã ghi nhận lịch sử chơi!' });
    } catch (error) {
        console.error("Lỗi lưu lịch sử chơi:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu lịch sử!' });
    }
};


exports.getPlayHistory = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Thiếu token xác thực!' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const [rows] = await db.query(
            `SELECT 
                l.id_may, 
                l.id_gau_trung, 
                l.thoi_gian,
                g.ten_gau,
                COALESCE(g.gia_tri_diem, 0) as gia_tri_diem,
                (
                    SELECT COALESCE(SUM(p.so_diem_tieu_hao), 0) 
                    FROM phieudoiqua p 
                    WHERE p.id_khach_hang = ? AND p.id_nhan_vien_duyet IS NOT NULL
                ) as diem_da_tieu
             FROM lichsuchoi l
             LEFT JOIN gaubong g ON l.id_gau_trung = g.id
             WHERE l.id_khach_hang = ? 
             ORDER BY l.thoi_gian DESC`,
            [decoded.id, decoded.id]
        );

        return res.status(200).json({ 
            success: true, 
            history: rows 
        });
    } catch (error) {
        console.error(" Lỗi lấy lịch sử chơi từ MySQL:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống không lấy được lịch sử!' });
    }
};



exports.getMachineQuantities = async (req, res) => {
    try {
        
        const [rows] = await db.query(
            `SELECT 
                g.id_may, 
                m.ten_may,
                m.so_xu_tren_luot, 
                SUM(g.so_luong_hien_tai) as tong_so_luong 
             FROM gautrongmay g
             INNER JOIN maygapgau m ON g.id_may = m.id
             GROUP BY g.id_may, m.ten_may, m.so_xu_tren_luot`
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(" Lỗi đồng bộ số lượng máy gắp:", error);
        return res.status(500).json({ success: false, data: [] });
    }
};
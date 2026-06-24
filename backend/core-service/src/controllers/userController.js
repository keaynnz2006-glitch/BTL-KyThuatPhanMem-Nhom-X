    const UserModel = require('../models/userModel');
    const { CoinContext } = require('../strategies/coinPromotion');
    const jwt = require('jsonwebtoken');

    const JWT_SECRET = 'sieu-bao-mat-btl-2026';

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
            context.setStrategyByDate(); // Tự động chọn chiến lược dựa trên thời gian thực hiện tại
            const exactCoins = context.executeStrategy(amountVnd);

            await UserModel.updateBalance(userId, exactCoins);
            res.json({ success: true, message: `Nạp tiền thành công! Bạn được cộng ${exactCoins} xu vào tài khoản.` });
        } catch (err) { 
            res.status(500).json({ error: err.message }); 
        }
    };
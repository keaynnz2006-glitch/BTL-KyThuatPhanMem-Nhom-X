//Tiếp nhận request tra cứu số dư
//Tầng điều hướng xử lý Số dư tài khoản (Balance Controller)

const balanceService = require('../services/balance.service');

class BalanceController {

    //lấy userId từ mock token
    getUserIdFromToken(req) {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            throw new Error('Bạn chưa đăng nhập!');
        }

        const token = authHeader.replace('Bearer ', '');

        if (!token.startsWith('mock-token-')) {
            throw new Error('Token không hợp lệ!');
        }

        const userId = parseInt(
            token.replace('mock-token-', '')
        );

        if (isNaN(userId)) {
            throw new Error('Token không hợp lệ!');
        }

        return userId;
    }

    //API lấy số dư xu của người dùng
    //GET /api/balances
    async handleGetBalance(req, res) {
        try {

            const userId = this.getUserIdFromToken(req);

            const result = await balanceService.getBalance(userId);

            return res.status(200).json({
                success: true,
                fullName: result.fullName,
                coins: result.coins
            });

        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    //API trừ xu khi người dùng chơi gắp gấu
    //POST /api/balances/decrease
    async handleDeductCoins(req, res) {
        try {

            const userId = this.getUserIdFromToken(req);

            //giả sử mỗi lượt chơi tốn 10 xu
            const amountPerPlay = 10;

            const result = await balanceService.decreaseCoins(
                userId,
                amountPerPlay
            );

            return res.status(200).json({
                success: true,
                message: result.message,
                remainingCoins: result.remainingCoins
            });

        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new BalanceController();
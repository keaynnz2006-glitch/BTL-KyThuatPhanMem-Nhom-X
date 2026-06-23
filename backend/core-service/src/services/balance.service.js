//Xử lý logic lấy số dư từ bảng NguoiDung
const { poolPromise, sql } = require('../config/database');

class BalanceService{
    //lấy số dư xu hiện tại
    async getBalance(userId){
        try{
            if (!userId) {
                throw new Error("Không tìm thấy ID người dùng!");
            }

            const pool = await poolPromise;

            //lấy ra họ tên và số dư xu từ bảng NguoiDung dựa vào ID
            const result = await pool.request()
                .input('pUserId', sql.Int, userId)
                .query(`SELECT ho_ten, so_du_xu 
                        FROM NguoiDung 
                        WHERE id = @pUserId`);
            
            if (result.recordset.length === 0) {
                throw new Error("Người dùng không tồn tại!");
            }

            const user = result.recordset[0];

            return {
                success: true,
                fullName: user.ho_ten,
                coins: user.so_du_xu
            };
        }catch (error) {
            throw new Error(error.message);
        }
    }

    //hàm trừ xu khi gắp gấu
    async decreaseCoins(userId, amount){
        try{
            if (!Number.isInteger(userId)) {
                throw new Error("Không tìm thấy ID người dùng!");
            }

            const pool = await poolPromise;

            const checkUser = await pool.request()
                .input('pUserId', sql.Int, userId)
                .query(`SELECT so_du_xu 
                        FROM NguoiDung 
                        WHERE id = @pUserId`);

            if (checkUser.recordset.length === 0) {
                throw new Error("Người dùng không tồn tại!");
            }

            //kiểm tra xem người dùng có đủ xu để chơi không
            const currentCoins = checkUser.recordset[0].so_du_xu;

            if (currentCoins < amount) {
                throw new Error(`Số dư xu không đủ! Bạn cần ${amount} xu nhưng hiện tại chỉ có ${currentCoins} xu.`);
            }

            //trừ xu
            await pool.request()
                .input('pUserId', sql.Int, userId)
                .input('pAmount', sql.Int, amount)
                .query(`UPDATE NguoiDung 
                        SET so_du_xu = so_du_xu - @pAmount 
                        WHERE id = @pUserId`);

            return {
                success: true,
                message: `Bắt đầu!`,
                remainingCoins: currentCoins - amount
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new BalanceService();
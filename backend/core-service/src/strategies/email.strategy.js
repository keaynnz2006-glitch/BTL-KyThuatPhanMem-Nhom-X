//Đăng kí/ Đăng nhập bằng email
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../config/database');

class EmailAuthStrategy{
    //đăng kí bằng email
    async register(data){
        try {
            const {username, password, fullName, phone} = data;

            if (!username || !password || !fullName || !phone) {
                throw new Error("Vui lòng nhập đầy đủ thông tin!");
            }
            
            const pool = await poolPromise;

            //kiểm tra xem tài khoản đã tồn tại hay chưa
            const checkUser = await pool.request()
                .input('inputAccount', sql.VarChar, username)
                .query(`SELECT id 
                        FROM NguoiDung 
                        WHERE tai_khoan = @inputAccount`);

            if (checkUser.recordset.length > 0){
                throw new Error("Tên tài khoản đã tồn tại!");
            }

            //nếu chưa có tài khoản thì thêm mới
            //so_du_xu = 0, mặc định vai_tro = 'KhachHang'
            //Hash mật khẩu trước khi lưu
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.request().input('pTaiKhoan', sql.VarChar, username)
                                .input('pMatKhau', sql.VarChar, hashedPassword)
                                .input('pHoTen', sql.NVarChar, fullName)
                                .input('pSoDienThoai', sql.VarChar, phone)
                                .query(`INSERT INTO NguoiDung (tai_khoan, mat_khau, ho_ten, so_dien_thoai, so_du_xu, vai_tro)
                                       VALUES (@pTaiKhoan, @pMatKhau, @pHoTen, @pSoDienThoai, 0, 'KhachHang')
                                    `);
            return {
                success: true,
                message: "Đăng kí tài khoản khách hàng thành công!"
            };
        } catch (error){
            throw new Error(error.message);
        }
    }

    //đăng nhập bằng email
    async login(data){
        try {
            const {username, password} = data;

            if (!username || !password){
                throw new Error("Vui lòng điền đầy đủ thông tin!");
            }

            const pool = await poolPromise;

            //tim nguoi dung
            const result = await pool.request()
                    .input('pTaiKhoan', sql.VarChar, username)
                    .query(`SELECT id, tai_khoan, mat_khau, ho_ten, vai_tro
                        FROM NguoiDung
                        WHERE tai_khoan = @pTaiKhoan`);

            if (result.recordset.length === 0){
                throw new Error("Sai thông tin đăng nhập!");
            }

            const user = result.recordset[0];
            //so sanh mat khau
            const truePassword = await bcrypt.compare(password, user.mat_khau);
            if (!truePassword){
                throw new Error("Sai thông tin đăng nhập!");
            }

            return{
                success: true,
                message: "Đăng nhập thành công!",
                user: {
                    id: user.id,
                    username: user.tai_khoan,
                    fullName: user.ho_ten,
                    role: user.vai_tro
                },
                token: "mock-jwt-token-cho-email"
            };
        } catch (error){
            throw new Error(error.message);
        }
    }
}

module.exports = new EmailAuthStrategy();
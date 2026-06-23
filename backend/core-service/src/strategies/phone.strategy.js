//Đăng kí/ Đăng nhập bằng số điện thoại 
const bcrypt = require('bcrypt');
const { poolPromise, sql} = require('../config/database');

class PhoneAuthStrategy{
    //dang ky
    async register(data){
        try{
            const {phone, fullName, username, password} = data;

            if(!phone || !fullName || !username || !password){
                throw new Error("Vui lòng nhập đầy đủ thông tin!");
            }

            //kiểm tra định dạng số điện thoại
            const phoneRegex = /^[0-9]{10}$/;

            if (!phoneRegex.test(phone)) {
                throw new Error("Số điện thoại không hợp lệ!");
            }

            const pool = await poolPromise;

            //kiểm tra số điện thoại đã được đăng kí hay chưa
            const checkPhone = await pool.request()
                    .input('pPhone', sql.VarChar, phone)
                    .query(`SELECT id
                            FROM NguoiDung
                            WHERE so_dien_thoai = @pPhone`);

            if (checkPhone.recordset.length > 0) {
                throw new Error("Số điện thoại này đã được sử dụng!");
            }

            //kiểm tra xem username có bị trùng không
            const checkUser = await pool.request()
                .input('pAccount', sql.VarChar, username)
                .query(`SELECT id FROM NguoiDung WHERE tai_khoan = @pAccount`);

            if (checkUser.recordset.length > 0) {
                throw new Error("Tên tài khoản này đã tồn tại!");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            //thêm người dùng mới
            await pool.request()
                .input('pTaiKhoan', sql.VarChar, username)
                .input('pMatKhau', sql.VarChar, hashedPassword) 
                .input('pHoTen', sql.NVarChar, fullName)
                .input('pSoDienThoai', sql.VarChar, phone)
                .query(`INSERT INTO NguoiDung (tai_khoan, mat_khau, ho_ten, so_dien_thoai, so_du_xu, vai_tro)
                        VALUES (@pTaiKhoan, @pMatKhau, @pHoTen, @pSoDienThoai, 0, N'KhachHang')`);

            return {
                success: true,
                message: "Đăng ký tài khoản bằng số điện thoại thành công!"
            };
        } catch (error){
            throw new Error(error.message);
        }
    }

    async login(data){
        try{
            //username có thể là số điện thoại hoặc tên tài khoản
            const {username, password} = data;

            if ( !username || !password){
                throw new Error("Vui lòng điền đầy đủ thông tin!");
            }

            const pool = await poolPromise;
            
            const result = await pool.request()
                .input('pUsername', sql.VarChar, username)
                .query(`SELECT id, tai_khoan, mat_khau, ho_ten, vai_tro 
                        FROM NguoiDung 
                        WHERE tai_khoan = @pUsername OR so_dien_thoai = @pUsername`);

            if (result.recordset.length === 0) {
                throw new Error("Sai thông tin đăng nhập!");
            }

            const user = result.recordset[0];

            //so sánh mật khẩu
            const truePassword = await bcrypt.compare(password, user.mat_khau);

            if (!truePassword){
                throw new Error("Sai thông tin đăng nhập!");
            }

            return {
                success: true,
                message: "Đăng nhập hệ thống thành công!",
                user: {
                    id: user.id,
                    username: user.tai_khoan,
                    fullName: user.ho_ten,
                    role: user.vai_tro
                },
                token: `mock-token-${user.id}`
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new PhoneAuthStrategy();
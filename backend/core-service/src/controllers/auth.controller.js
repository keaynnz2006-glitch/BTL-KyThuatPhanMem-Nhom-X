//Tiếp nhận request Đăng kí/ Đăng nhập
const authService = require('../services/auth.service');

class AuthController{
    //đăng kí
    async handleRegister(req, res){
        try{
            // Frontend khi gọi API sẽ truyền object có dạng:
            //  { type: 'phone', 
            //    data: { username: '...', password: '...' } }
            const { type, data } = req.body;

            const result = await authService.register(type, data);

            return res.status(201).json({
                success: true,
                message: result.message
            });
        }catch (error) {
            //Nếu có lỗi xảy ra, trả về mã 400 (Bad Request)
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    //đăng nhập
    async handleLogin(req, res) {
        try {
            const { type, data } = req.body;

            // Gọi Service xử lý đăng nhập
            const result = await authService.login(type, data);

            // Đăng nhập thành công, trả về mã 200 (OK) kèm thông tin user và mã token để Frontend lưu lại
            return res.status(200).json({
                success: true,
                message: result.message,
                user: result.user,
                token: result.token
            });
        } catch (error) {
            // Đăng nhập thất bại (sai mật khẩu hoặc tên đăng nhập), trả về mã 400
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}
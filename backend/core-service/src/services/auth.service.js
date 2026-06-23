//Điều hướng gọi Stratery tương ứng
const authFactory = require('../strategies/auth.factory');

class AuthService{
    async register(type, data){
        try{
            if (!type){
                throw new Error("Vui lòng chọn phương thức đăng kí!");
            }

            const strategy = authFactory.getAuthStrategy(type);
            const result = await strategy.register(data);
            return result;
        } catch (error){
            throw new Error(error.message);
        }
    }

    async login(type, data){
        try{
            if (!type){
                throw new Error("Vui lòng chọn phương thức đăng nhập!");
            }

            const strategy = authFactory.getAuthStrategy(type);
            const result = await strategy.login(data);
            return result;
        } catch(error){
            throw new Error(error.message);
        }
    }
}

module.exports = new AuthService();
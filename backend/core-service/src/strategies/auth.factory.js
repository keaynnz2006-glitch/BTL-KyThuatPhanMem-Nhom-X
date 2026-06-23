//Quản lý Stratery
const emailAuthStrategy = require('./email.strategy');
const phoneAuthStrategy = require('./phone.strategy');

class AuthFactory {
    getAuthStrategy(type) {
        //Chuyển chữ về dạng viết thường để tránh lỗi người dùng truyền 'Email' hoặc 'EMAIL'
        const strategyType = type ? type.toLowerCase() : '';

        switch (strategyType) {
            case 'email':
                return emailAuthStrategy;
            case 'phone':
                return phoneAuthStrategy;
            default:
                throw new Error(`Hệ thống máy gắp gấu chưa hỗ trợ phương thức xác thực: ${type}`);
        }
    }
}


module.exports = new AuthFactory();
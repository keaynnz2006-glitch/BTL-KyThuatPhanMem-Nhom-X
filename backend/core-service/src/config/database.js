//File kết nối với sql
const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Dùng cho Azure hoặc cấu hình bảo mật
        trustServerCertificate: true // Tránh lỗi chứng chỉ bảo mật khi chạy dưới localhost
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Tạo một pool kết nối toàn cục
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('[OK] Đã kết nối thành công tới SQL Server!');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};
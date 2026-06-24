const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'andz2006', 
    database: 'cua_hang_gap_gau', // Tên DB theo đúng file thiết kế ERD
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối nhanh khi khởi động backend
pool.getConnection()
    .then(() => console.log(' MySQL Workbench đã kết nối thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối CSDL ', err.message));

module.exports = pool;
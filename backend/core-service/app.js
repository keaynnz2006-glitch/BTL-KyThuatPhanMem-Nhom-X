const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes'); //  
const staffRoutes = require('./src/routes/staffRoutes'); // Thêm route Nhân viên

const customerRoutes = require('./src/routes/customerRoutes');//duyet phieu
const app = express();
app.use(cors());
app.use(express.json());


app.use('/api', authRoutes); 

// Phân luồng các nhóm API hệ thống theo đúng Module cho Frontend mới
app.use('/api/auth', authRoutes);   // Tiền tố xử lý Đăng nhập / Đăng ký riêng
app.use('/api/admin', adminRoutes); // Tiền tố xử lý số liệu Dashboard Admin
app.use('/api/staff', staffRoutes);
app.use('/api', customerRoutes); // Tiền tố xử lý duyệt phiếu của Nhân viên

const PORT = 3000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Core Service đang chạy mượt mà tại cổng http://localhost:${PORT}`));
}

module.exports = app; // Export app ra để làm Unit Test
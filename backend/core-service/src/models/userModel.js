const db = require('../config/database');

const UserModel = {
    // Tìm người dùng bằng tài khoản (phục vụ Đăng Nhập / Đăng Ký)
    findByUsername: async (tai_khoan) => {
        const [rows] = await db.query('SELECT * FROM NguoiDung WHERE tai_khoan = ?', [tai_khoan]);
        return rows[0];
    },

    // Tìm người dùng bằng ID (phục vụ lấy số dư xu)
    findById: async (id) => {
        const [rows] = await db.query('SELECT id, ho_ten, so_du_xu FROM NguoiDung WHERE id = ?', [id]);
        return rows[0];
    },

    // Thêm người dùng mới (Mặc định khi đăng ký xong có sẵn 0 xu)
    create: async (tai_khoan, hashedPassword, ho_ten, vai_tro) => {
        const [result] = await db.query(
            'INSERT INTO NguoiDung (tai_khoan, mat_khau, ho_ten, vai_tro, so_du_xu) VALUES (?, ?, ?, ?, ?)',
            [tai_khoan, hashedPassword, ho_ten, vai_tro || 'KhachHang', 0]
        );
        return result.insertId;
    },

    // Cập nhật số dư xu khi nạp tiền
    updateBalance: async (userId, coinsToAdd) => {
        const [result] = await db.query(
            'UPDATE NguoiDung SET so_du_xu = so_du_xu + ? WHERE id = ?',
            [coinsToAdd, userId]
        );
        return result;
    },

    // Lưu lịch sử chơi vào MySQL
     async savePlayHistory(id_khach_hang, id_may, id_gau_trung) {
    // 1. Ghi nhận lượt chơi vào bảng lịch sử
    await db.query(
        'INSERT INTO LichSuChoi (id_khach_hang, id_may, id_gau_trung, thoi_gian) VALUES (?, ?, ?, NOW())',
        [id_khach_hang, id_may, id_gau_trung]
    );

    if (id_gau_trung !== null) {
        await db.query(
            `UPDATE gautrongmay 
             SET so_luong_hien_tai = GREATEST(0, so_luong_hien_tai - 1) 
             WHERE id_may = ? AND id_gau = ?`,
            [id_may, id_gau_trung]
        );
        console.log(`✨ [MySQL] Máy ${id_may} gắp trúng Gấu ID ${id_gau_trung} -> Đã trừ kho thật dưới DB!`);
    }
}
};

module.exports = UserModel;
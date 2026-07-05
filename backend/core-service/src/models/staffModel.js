// Đảm bảo đường dẫn này trỏ đúng tới file kết nối database của bro (db hoặc connection)
const db = require('../config/database');

const StaffModel = {
    // Query JOIN lấy danh sách phiếu chưa duyệt (id_nhan_vien_duyet là NULL)
    getAllTickets: async () => {
        const query = `
            SELECT p.id, n.tai_khoan AS ten_khach, g.ten_gau, p.so_diem_tieu_hao, p.thoi_gian 
            FROM phieudoiqua p
            JOIN nguoidung n ON p.id_khach_hang = n.id
            JOIN gaubong g ON p.id_gau_muon_doi = g.id
            WHERE p.id_nhan_vien_duyet IS NULL
            ORDER BY p.thoi_gian DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // Tìm kiếm phiếu theo ID để kiểm tra sự tồn tại
    findTicketById: async (ticketId) => {
        const query = 'SELECT * FROM phieudoiqua WHERE id = ?';
        const [rows] = await db.query(query, [ticketId]);
        return rows[0];
    },

    // Cập nhật ID nhân viên duyệt vào phiếu đổi quà
    updateApprove: async (ticketId, staffId) => {
        const query = 'UPDATE phieudoiqua SET id_nhan_vien_duyet = ? WHERE id = ?';
        const [result] = await db.query(query, [staffId, ticketId]);
        return result;
    }
};

module.exports = StaffModel;
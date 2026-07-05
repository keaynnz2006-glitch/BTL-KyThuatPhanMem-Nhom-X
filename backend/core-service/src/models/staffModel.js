const db = require('../config/database');

const StaffModel = {
    // 1. Lấy danh sách phiếu kèm số điểm thực tế của khách hàng
    getAllTickets: async () => {
        const query = `
            SELECT 
                p.id, 
                n.tai_khoan AS ten_khach, 
                g.ten_gau, 
                p.so_diem_tieu_hao, 
                p.thoi_gian,
                (
                    (SELECT COALESCE(SUM(gb.gia_tri_diem), 0) FROM lichsuchoi l JOIN gaubong gb ON l.id_gau_trung = gb.id WHERE l.id_khach_hang = p.id_khach_hang)
                    -
                    (SELECT COALESCE(SUM(p2.so_diem_tieu_hao), 0) FROM phieudoiqua p2 WHERE p2.id_khach_hang = p.id_khach_hang AND p2.id_nhan_vien_duyet IS NOT NULL)
                ) AS diem_hien_tai
            FROM phieudoiqua p
            JOIN nguoidung n ON p.id_khach_hang = n.id
            JOIN gaubong g ON p.id_gau_muon_doi = g.id
            WHERE p.id_nhan_vien_duyet IS NULL
            ORDER BY p.thoi_gian DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // 2. Tìm kiếm phiếu theo ID
    findTicketById: async (ticketId) => {
        const query = 'SELECT * FROM phieudoiqua WHERE id = ?';
        const [rows] = await db.query(query, [ticketId]);
        return rows[0];
    },

    // 3. Cập nhật ID nhân viên duyệt vào phiếu đổi quà 
    updateApprove: async (ticketId, staffId) => {
        const query = 'UPDATE phieudoiqua SET id_nhan_vien_duyet = ? WHERE id = ?';
        const [result] = await db.query(query, [staffId, ticketId]);
        return result;
    }
};

module.exports = StaffModel;
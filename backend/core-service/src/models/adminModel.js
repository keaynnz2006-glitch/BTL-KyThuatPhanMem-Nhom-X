const db = require('../config/database'); 

class AdminModel {
    static async getStats() {
        const [revenue] = await db.query(`SELECT COALESCE(SUM(so_tien_vnd), 0) as total_revenue FROM hoadonnapxu`);
        const [stuffed] = await db.query(`SELECT COALESCE(SUM(so_luong_kho), 0) as total_stuffed FROM gaubong`);
        const [machines] = await db.query(`SELECT COUNT(*) as total_machines FROM maygapgau`);
        
        return {
            totalRevenue: revenue[0].total_revenue,
            totalStuffed: stuffed[0].total_stuffed,
            totalMachines: machines[0].total_machines
        };
    }

    static async getRecentOrders() {
        const [rows] = await db.query(`
            SELECT h.id, n.ho_ten, h.so_tien_vnd, h.thoi_gian 
            FROM hoadonnapxu h
            JOIN nguoidung n ON h.id_khach_hang = n.id
            ORDER BY h.thoi_gian DESC LIMIT 5
        `);
        return rows;
    }
    
    static async getAllToys() {
        const [rows] = await db.query(`
            SELECT id, ten_gau, gia_tri_diem, so_luong_kho as so_luong, hinh_anh 
            FROM gaubong 
            ORDER BY id DESC
        `);
        return rows;
    }

    // 🔥 SỬA BIẾN Ở ĐÂY: Đổi thẳng tên tham số thứ 3 thành so_luong_kho cho khỏi lệch phe
    static async addToy(ten_gau, gia_tri_diem, so_luong_kho, hinh_anh) {
        const [result] = await db.query(
            `INSERT INTO gaubong (ten_gau, gia_tri_diem, so_luong_kho, hinh_anh) VALUES (?, ?, ?, ?)`,
            [ten_gau, gia_tri_diem, so_luong_kho, hinh_anh]
        );
        return result.insertId;
    }

    static async deleteToy(id) {
        await db.query(`DELETE FROM gaubong WHERE id = ?`, [id]);
        return true;
    }

    // 🌟 THÊM MỚI: Hàm xử lý nhóm doanh thu theo Ngày, Tháng, Năm (Đồng bộ 100% với hoadonnapxu)
    static async getRevenueByTimeline(type) {
        let formatQuery = '';
        
        if (type === 'day') {
            formatQuery = "DATE_FORMAT(thoi_gian, '%Y-%m-%d')"; // Gom nhóm theo ngày (VD: 2026-07-07)
        } else if (type === 'month') {
            formatQuery = "DATE_FORMAT(thoi_gian, '%Y-%m')";    // Gom nhóm theo tháng (VD: 2026-07)
        } else if (type === 'year') {
            formatQuery = "DATE_FORMAT(thoi_gian, '%Y')";       // Gom nhóm theo năm (VD: 2026)
        }

        const query = `
            SELECT 
                ${formatQuery} AS moc_thoi_gian,
                COUNT(id) AS so_luot_giao_dich,
                SUM(so_tien_vnd) AS tong_doanh_thu
            FROM hoadonnapxu
            GROUP BY moc_thoi_gian
            ORDER BY moc_thoi_gian DESC
            LIMIT 30
        `;
        
        const [rows] = await db.query(query);
        return rows;
    }
}

module.exports = AdminModel;
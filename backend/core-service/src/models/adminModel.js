const db = require('../config/database'); 

class AdminModel {
    static async getStats() {
        // 🔥 Đã sửa thành so_tien_vnd theo đúng ERD
        const [revenue] = await db.query(`SELECT COALESCE(SUM(so_tien_vnd), 0) as total_revenue FROM hoadonnapxu`);
        const [stuffed] = await db.query(`SELECT COUNT(*) as total_stuffed FROM gaubong`);
        const [machines] = await db.query(`SELECT COUNT(*) as total_machines FROM maygapgau`);
        
        return {
            totalRevenue: revenue[0].total_revenue,
            totalStuffed: stuffed[0].total_stuffed,
            totalMachines: machines[0].total_machines
        };
    }

    static async getRecentOrders() {
        // 🔥 Đã sửa thành h.so_tien_vnd theo đúng ERD
        const [rows] = await db.query(`
            SELECT h.id, n.ho_ten, h.so_tien_vnd, h.thoi_gian 
            FROM hoadonnapxu h
            JOIN nguoidung n ON h.id_khach_hang = n.id
            ORDER BY h.thoi_gian DESC LIMIT 5
        `);
        return rows;
    }
}

module.exports = AdminModel;
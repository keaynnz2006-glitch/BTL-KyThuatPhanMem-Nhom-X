const db = require('../config/database'); // 🔥 Sửa dòng này cho giống UserModel

class StaffModel {
    static async getAllTickets() {
        const [rows] = await db.query(`SELECT * FROM phieudoiqua ORDER BY id DESC`);
        return rows;
    }

    static async findTicketById(id) {
        const [rows] = await db.query(`SELECT * FROM phieudoiqua WHERE id = ?`, [id]);
        return rows[0];
    }

    static async updateApprove(ticketId, staffId) {
        await db.query(
            `UPDATE phieudoiqua SET id_nhan_vien_duyet = ? WHERE id = ?`,
            [staffId, ticketId]
        );
        return true;
    }
}

module.exports = StaffModel;
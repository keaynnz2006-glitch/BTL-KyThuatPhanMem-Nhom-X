const db = require('../config/database');

exports.createTicket = async (req, res) => {
    const { id_khach_hang, id_gau_muon_doi, so_diem_tieu_hao } = req.body;

    if (!id_khach_hang || !id_gau_muon_doi || !so_diem_tieu_hao) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin đổi quà bro ơi!' });
    }

    try {
        // 1. 🔥 ĐÃ SỬA: Kiểm tra số dư xu thực tế bằng cột 'so_du_xu'
        const [userRows] = await db.query('SELECT so_du_xu FROM nguoidung WHERE id = ?', [id_khach_hang]);
        
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản người chơi!' });
        }

        const xuHienTai = userRows[0].so_du_xu;
        if (xuHienTai < so_diem_tieu_hao) {
            return res.status(400).json({ success: false, message: 'Bro không đủ xu tích lũy để đổi món quà này!' });
        }

        // 2. Tạo phiếu đổi quà mới (Trạng thái chờ duyệt NULL)
        const insertQuery = `
            INSERT INTO phieudoiqua (id_khach_hang, id_gau_muon_doi, so_diem_tieu_hao, thoi_gian, id_nhan_vien_duyet) 
            VALUES (?, ?, ?, NOW(), NULL)
        `;
        await db.query(insertQuery, [id_khach_hang, id_gau_muon_doi, so_diem_tieu_hao]);

        // 3. 🔥 ĐÃ SỬA CHÍ MẠNG: Khấu trừ xu trực tiếp vào cột 'so_du_xu'
        const updateQuery = `
            UPDATE nguoidung 
            SET so_du_xu = so_du_xu - ? 
            WHERE id = ?
        `;
        await db.query(updateQuery, [so_diem_tieu_hao, id_khach_hang]);

        // Trả về kết quả thành công cho Frontend
        return res.status(201).json({ 
            success: true, 
            message: 'Tạo phiếu đổi quà và khấu trừ xu thành công!' 
        });

    } catch (error) {
        console.error("❌ Lỗi xử lý đổi quà và trừ xu:", error.message);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi trừ xu người chơi!' });
    }
};
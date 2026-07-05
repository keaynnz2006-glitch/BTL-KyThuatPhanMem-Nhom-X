const db = require('../config/database');

exports.createTicket = async (req, res) => {
    const { id_khach_hang, id_gau_muon_doi, so_diem_tieu_hao } = req.body;

    if (!id_khach_hang || !id_gau_muon_doi || !so_diem_tieu_hao) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin đổi quà bro ơi!' });
    }

    try {
       
        const insertTicketQuery = `
            INSERT INTO phieudoiqua (id_khach_hang, id_gau_muon_doi, so_diem_tieu_hao, thoi_gian, id_nhan_vien_duyet) 
            VALUES (?, ?, ?, NOW(), NULL)
        `;
        await db.query(insertTicketQuery, [id_khach_hang, id_gau_muon_doi, so_diem_tieu_hao]);

        return res.status(201).json({ 
            success: true, 
            message: 'Tạo phiếu đổi quà thành công!' 
        });

    } catch (error) {
        console.error(" Lỗi xử lý đổi quà:", error.message);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tạo phiếu!' });
    }
};
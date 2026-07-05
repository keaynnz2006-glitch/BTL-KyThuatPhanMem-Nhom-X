const StaffModel = require('../models/staffModel');
const db = require('../config/database'); // Nhớ import db để chạy câu lệnh SELECT điểm cho nhanh gọn bro nhé

// 1. Lấy danh sách các phiếu CHƯA DUYỆT (Giữ nguyên của bro)
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await StaffModel.getAllTickets();
        return res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách phiếu:", error);
        return res.status(500).json({ success: false, message: 'Không thể lấy danh sách phiếu!' });
    }
};

// 2. Nhân viên bấm duyệt phiếu đổi quà - FIX CHỐNG ÂM ĐIỂM + TỰ ĐỘNG CHECK & TRỪ SỐ LƯỢNG TRONG MÁY
exports.approveTicket = async (req, res) => {
  
    const ticketId = req.params.id; 
    
    const { staffId } = req.body; 
    const finalStaffId = staffId || req.user?.id || 1; 

    try {
        // Kiểm tra xem phiếu có tồn tại trong hệ thống không
        const ticket = await StaffModel.findTicketById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu đổi quà này bro!' });
        }

        // 🛑 BẪY CHẶN SPAM DUYỆT: Nếu phiếu này ĐÃ ĐƯỢC DUYỆT RỒI thì dừng luôn
        if (ticket.id_nhan_vien_duyet !== null) {
            return res.status(400).json({ success: false, message: 'Phiếu này đã được duyệt cấp quà từ trước rồi bro!' });
        }

        const idKhachHang = ticket.id_khach_hang;
        const idGauMuonDoi = ticket.id_gau_muon_doi; 
        const soDiemPhieuNay = parseInt(ticket.so_diem_tieu_hao || 0);

        // 🛑 BƯỚC THÊM MỚI (Dựa theo đúng ERD): Tự động tìm máy gắp nào đang chứa loại gấu này và còn hàng (> 0)
        const [machineBearRows] = await db.query(
            `SELECT id_may, so_luong_hien_tai 
             FROM gautrongmay 
             WHERE id_gau = ? AND so_luong_hien_tai > 0 
             ORDER BY so_luong_hien_tai DESC 
             LIMIT 1`, 
            [idGauMuonDoi]
        );

        // Nếu tất cả các máy đều hết loại gấu này rồi -> Chặn không cho duyệt
        if (machineBearRows.length === 0) {
            const [bearInfo] = await db.query('SELECT ten_gau FROM gaubong WHERE id = ?', [idGauMuonDoi]);
            const tenGau = bearInfo[0]?.ten_gau || 'Gấu bông';
            return res.status(400).json({ 
                success: false, 
                message: `❌ Không thể duyệt! Loại gấu [${tenGau}] ở tất cả các máy gắp đã hết sạch, vui lòng nạp thêm gấu vào máy!` 
            });
        }
        
        // Xác định máy mục tiêu để chuẩn bị trừ kho
        const targetMachine = machineBearRows[0];
        const idMayCanTru = targetMachine.id_may;

        // 🔥 CHECK ĐIỂM THỰC TẾ TRƯỚC KHI CHO PHÉP UPDATE APPROVE
        // 1. Tổng điểm gắp trúng của khách
        const [pointsRows] = await db.query(
            `SELECT COALESCE(SUM(g.gia_tri_diem), 0) as tong_trung 
             FROM lichsuchoi l 
             JOIN gaubong g ON l.id_gau_trung = g.id 
             WHERE l.id_khach_hang = ?`, 
            [idKhachHang]
        );
        const tongTrung = parseInt(pointsRows[0].tong_trung || 0);

        // 2. Tổng điểm của các phiếu ĐÃ DUYỆT thực tế (Những phiếu có id_nhan_vien_duyet)
        const [spentRows] = await db.query(
            `SELECT COALESCE(SUM(so_diem_tieu_hao), 0) as da_tieu 
             FROM phieudoiqua 
             WHERE id_khach_hang = ? AND id_nhan_vien_duyet IS NOT NULL`, 
            [idKhachHang]
        );
        const tongDaTieu = parseInt(spentRows[0].da_tieu || 0);

        // Điểm thực tế của khách tại ĐÚNG GIÂY PHÚT nhân viên ấn nút Duyệt
        const diemThucTeConLai = tongTrung - tongDaTieu;

        // ❌ CHẶN ĐỨNG: Nếu điểm còn lại nhỏ hơn điểm của phiếu này -> Báo lỗi, không cập nhật database!
        if (diemThucTeConLai < soDiemPhieuNay) {
            return res.status(400).json({ 
                success: false, 
                message: `Khách chỉ còn [${diemThucTeConLai} điểm] thực tế. Không đủ [${soDiemPhieuNay} điểm] để duyệt thêm phiếu này!` 
            });
        }

        // ====================================================================
        // ĐỦ ĐIỂM + CÒN GẤU TRONG MÁY -> TIẾN HÀNH DUYỆT VÀ TỰ ĐỘNG TRỪ SỐ LƯỢNG MÁY
        // ====================================================================

        // Hợp lệ -> Gọi model cập nhật id_nhan_vien_duyet vào database (Giữ nguyên của bro)
        await StaffModel.updateApprove(ticketId, finalStaffId);

        // 🔥 CẬP NHẬT TRỪ SỐ LƯỢNG: Trừ bớt 1 gấu ở cột so_luong_hien_tai trong bảng gautrongmay
        await db.query(
            `UPDATE gautrongmay 
             SET so_luong_hien_tai = so_luong_hien_tai - 1 
             WHERE id_may = ? AND id_gau = ?`, 
            [idMayCanTru, idGauMuonDoi]
        );

        return res.status(200).json({ 
            success: true, 
            message: `🎉 Duyệt cấp quà thành công! Đã tự động trừ 1 gấu tại Máy số #${idMayCanTru}.` 
        });

    } catch (error) {
        console.error("❌ Lỗi cập nhật duyệt phiếu:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi duyệt phiếu!' });
    }
};

// 3. Nhân viên bấm hủy phiếu (Xóa hẳn khỏi DB) (Giữ nguyên của bro)
exports.rejectTicket = async (req, res) => {
    const ticketId = req.params.id; // Thống nhất dùng .id giống hàm approve của bro nhé

    try {
        // Chỉ xóa khi phiếu chưa được duyệt
        const [result] = await db.query(
            'DELETE FROM phieudoiqua WHERE id = ? AND id_nhan_vien_duyet IS NULL', 
            [ticketId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: 'Không thể hủy phiếu hoặc phiếu đã được duyệt rồi bro!' });
        }

        return res.status(200).json({ success: true, message: '❌ Đã hủy phiếu đổi quà thành công!' });
    } catch (error) {
        console.error("❌ Lỗi khi hủy phiếu:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi hủy phiếu!' });
    }
};

// ====================================================================
// 🔥 CÁC HÀM PHỤC VỤ TÍNH NĂNG THÊM/NẠP GẤU VÀO MÁY Ở TRANG NHÂN VIÊN
// ====================================================================

// 4. Lấy danh sách máy hoạt động đổ vào <select> ở giao diện
exports.getAllMachines = async (req, res) => {
    try {
        const [machines] = await db.query('SELECT id, ten_may FROM maygapgau WHERE trang_thai = "Hoạt động"');
        return res.status(200).json({ success: true, machines });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Lấy danh sách tất cả loại gấu đổ vào <select> ở giao diện
exports.getAllBears = async (req, res) => {
    try {
        const [bears] = await db.query('SELECT id, ten_gau FROM gaubong');
        return res.status(200).json({ success: true, bears });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Xử lý nạp gấu vào máy gắp (Cập nhật hoặc cộng dồn vào bảng gautrongmay)
// 6. Xử lý nạp gấu vào máy gắp (Tự động CỘNG DỒN vào máy và TRỪ KHO TỔNG)
// 6. Xử lý nạp gấu vào máy gắp (Tự động CỘNG DỒN vào máy và TRỪ KHO TỔNG) - ĐÃ FIX HẾT LỖI BIẾN
exports.replenishBearToMachine = async (req, res) => {
    const { id_may, id_gau, so_luong_them } = req.body;
    const qty = parseInt(so_luong_them);

    if (!id_may || !id_gau || !qty || qty <= 0) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ và hợp lệ các thông tin bro ơi!' });
    }

    // Lấy kết nối để chạy Transaction giúp đồng bộ dữ liệu an toàn
    const connection = await db.getConnection();

    try {
        // Bắt đầu Transaction
        await connection.beginTransaction();

        // BƯỚC 1: Sử dụng đúng biến id_gau để kiểm tra kho tổng (bảng gaubong)
        const [bearStock] = await connection.query(
            'SELECT so_luong_kho, ten_gau FROM gaubong WHERE id = ?',
            [id_gau]
        );

        if (bearStock.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại quà này trong kho tổng!' });
        }

        const currentStock = parseInt(bearStock[0].so_luong_kho || 0);
        const tenGau = bearStock[0].ten_gau;

        if (currentStock < qty) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: `❌ Kho tổng chỉ còn [${currentStock} con ${tenGau}]. Không đủ số lượng để nạp ${qty} con vào máy!` 
            });
        }

        // BƯỚC 2: Cập nhật trừ số lượng ở kho tổng (bảng gaubong)
        await connection.query(
            'UPDATE gaubong SET so_luong_kho = so_luong_kho - ? WHERE id = ?',
            [qty, id_gau]
        );

        // BƯỚC 3: Nạp gấu vào máy (Cập nhật hoặc thêm mới dòng trong bảng gautrongmay)
        const queryReplenish = `
            INSERT INTO gautrongmay (id_may, id_gau, so_luong_hien_tai, ty_le_trung)
            VALUES (?, ?, ?, 0.3)
            ON DUPLICATE KEY UPDATE so_luong_hien_tai = so_luong_hien_tai + ?
        `;
        await connection.query(queryReplenish, [id_may, id_gau, qty, qty]);

        // Hoàn tất lưu mọi thay đổi vào Database nếu thông tin hợp lệ
        await connection.commit();

        return res.status(200).json({ 
            success: true, 
            message: `🎉 Thành công! Đã nạp ${qty} con [${tenGau}] vào Máy #${id_may} và trừ ${qty} con ở kho tổng.` 
        });

    } catch (error) {
        // Nếu có bất kỳ lỗi gì xảy ra, hủy bỏ toàn bộ lệnh SQL để tránh lệch kho
        await connection.rollback();
        console.error("❌ Lỗi nạp gấu vào máy:", error.message);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống, không thể nạp gấu vào máy!' });
    } finally {
        // Giải phóng kết nối trả về cho pool
        connection.release();
    }
};

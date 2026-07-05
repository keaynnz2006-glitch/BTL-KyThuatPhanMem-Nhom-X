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
        const soDiemPhieuNay = parseInt(ticket.so_diem_tieu_hao || 0);

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

        // Hợp lệ -> Gọi model cập nhật id_nhan_vien_duyet vào database (Giữ nguyên của bro)
        await StaffModel.updateApprove(ticketId, finalStaffId);
        return res.status(200).json({ success: true, message: 'Duyệt cấp quà thành công!' });

    } catch (error) {
        console.error("❌ Lỗi cập nhật duyệt phiếu:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi duyệt phiếu!' });
    }
};

// 3. Nhân viên bấm hủy phiếu (Xóa hẳn khỏi DB)
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
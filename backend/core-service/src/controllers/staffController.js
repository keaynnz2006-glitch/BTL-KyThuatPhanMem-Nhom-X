const StaffModel = require('../models/staffModel');

// 1. Lấy danh sách các phiếu CHƯA DUYỆT (id_nhan_vien_duyet IS NULL)
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await StaffModel.getAllTickets();
        return res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách phiếu:", error);
        return res.status(500).json({ success: false, message: 'Không thể lấy danh sách phiếu!' });
    }
};

// 2. Nhân viên bấm duyệt phiếu đổi quà (Lấy id từ URL params)
exports.approveTicket = async (req, res) => {
    // Lấy id từ params do route cấu hình là /approve/:id
    const ticketId = req.params.id; 
    
    // Lấy staffId từ body gửi lên, nếu ko có thì lấy từ token giải mã, quá tam ba bận ko có thì để là 1
    const { staffId } = req.body; 
    const finalStaffId = staffId || req.user?.id || 1; 

    try {
        // Kiểm tra xem phiếu có tồn tại trong hệ thống không
        const ticket = await StaffModel.findTicketById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu đổi quà này bro!' });
        }

        // Gọi model cập nhật id_nhan_vien_duyet vào database
        await StaffModel.updateApprove(ticketId, finalStaffId);
        return res.status(200).json({ success: true, message: 'Duyệt cấp quà thành công!' });
    } catch (error) {
        console.error("❌ Lỗi cập nhật duyệt phiếu:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi duyệt phiếu!' });
    }
};
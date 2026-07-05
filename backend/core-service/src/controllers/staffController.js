const StaffModel = require('../models/staffModel');

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
    const staffId = req.user?.id || 1; 

    try {
        const ticket = await StaffModel.findTicketById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu đổi quà này bro!' });
        }

        await StaffModel.updateApprove(ticketId, staffId);
        return res.status(200).json({ success: true, message: 'Duyệt cấp quà thành công!' });
    } catch (error) {
        console.error("❌ Lỗi cập nhật duyệt phiếu:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi duyệt phiếu!' });
    }
};
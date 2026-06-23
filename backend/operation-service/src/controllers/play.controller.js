const { dsMayGap } = require('../models/machine.model');

exports.playTurn = (req, res) => {
    const { machineId, giaLapLoiHeThong } = req.body;
    const machine = dsMayGap.find(m => m.id === parseInt(machineId));
    
    if (!machine) return res.status(404).json({ success: false, message: "Không tìm thấy máy gắp gấu này!" });

    if (machine.trangThai === 'Sự cố' || machine.trangThai === 'Hết gấu') {
        return res.status(400).json({
            success: false,
            message: `Máy đã bị KHÓA do đang ở trạng thái [${machine.trangThai}]. Hệ thống chặn không cho nạp xu!`
        });
    }

    if (giaLapLoiHeThong) {
        machine.setTrangThai('Sự cố', 'Khách báo máy bị kẹt xu, tay gắp không di chuyển.');
        return res.status(500).json({
            success: false,
            message: "Máy gặp sự cố phần cứng! Hệ thống tự động kích hoạt thông báo tới nhân viên.",
            trangThaiMay: machine.trangThai
        });
    }

    if (machine.currentToys === 0) {
        machine.setTrangThai('Hết gấu', 'Số lượng gấu hiện tại trong máy (currentToys) bằng 0.');
        return res.status(400).json({
            success: false,
            message: "Máy gắp này đã hết sạch gấu! Thiết bị tự động khóa để bảo trì.",
            trangThaiMay: machine.trangThai
        });
    }

    const trungGau = Math.random() < 0.3;
    if (trungGau) {
        machine.currentToys -= 1;
    }

    res.status(200).json({
        success: true,
        message: trungGau ? "Chúc mừng bạn đã gắp trúng gấu bông!" : "Hụt rồi, chúc bạn may mắn lần sau!",
        ketQua: trungGau ? "WIN" : "LOSE",
        soGauConLaiTrongMay: machine.currentToys
    });
};
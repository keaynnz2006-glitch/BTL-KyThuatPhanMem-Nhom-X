const { dsMayGap } = require('../models/machine.model');
const axios = require('axios');

exports.playTurn = async (req, res) => {
    const { machineId } = req.body;
    
    const token = req.headers['authorization']; 
    if (!token) return res.status(401).json({ success: false, message: "Thiếu token xác thực người dùng!" });

    const machine = dsMayGap.find(m => m.id === parseInt(machineId));
    if (!machine) return res.status(404).json({ success: false, message: "Không tìm thấy máy gắp gấu này!" });

    if (machine.trangThai === 'Sự cố' || machine.trangThai === 'Hết gấu') {
        return res.status(400).json({
            success: false,
            message: `Máy đã bị KHÓA do đang ở trạng thái [${machine.trangThai}]. Hệ thống chặn không cho nạp xu!`
        });
    }

    let currentToysInDB = 0;
    try {
        const qtyResponse = await axios.get('http://localhost:3000/api/machines/quantities');
        if (qtyResponse.data.success) {
            const match = qtyResponse.data.data.find(q => q.id_may === parseInt(machineId));
            currentToysInDB = match ? parseInt(match.tong_so_luong || 0) : 0;
            machine.currentToys = currentToysInDB;
        }
    } catch (err) {
        console.error("Không thể lấy số lượng gấu real-time từ con 3000, sử dụng RAM tạm:", err.message);
        currentToysInDB = machine.currentToys; 
    }

    if (currentToysInDB <= 0) {
        machine.setTrangThai('Hết gấu', 'Số lượng gấu thực tế bằng 0.');
        return res.status(400).json({
            success: false,
            message: "Máy gắp này đã hết sạch gấu! Thiết bị tự động khóa để bảo trì.",
            trangThaiMay: machine.trangThai
        });
    }

    // 1. TRỪ XU REAL-TIME
    try {
        const coreResponse = await axios.post('http://localhost:3000/api/user/deduct-coins', {
            coinsToDeduct: parseInt(machine.coinsPerPlay) 
        }, {
            headers: { 'Authorization': token }
        });

        if (!coreResponse.data.success) {
            return res.status(400).json({ success: false, message: "Tài khoản không đủ xu!" });
        }
    } catch (error) {
        return res.status(400).json({ 
            success: false, 
            message: error.response?.data?.message || "Không đủ xu hoặc lỗi kết nối ví tiền!" 
        });
    }

    // 2. TÍNH TOÁN KẾT QUẢ GẮP GẤU (Tỉ lệ 30%)
    let toyId = null; 
    const trungGau = Math.random() < 0.5;

    if (trungGau) {
        // Trừ ảo trên RAM trước để client cập nhật ngay lập tức
        machine.currentToys = Math.max(0, currentToysInDB - 1);

        if (parseInt(machineId) === 1) {
            const arrGau = [1, 2, 3];
            toyId = arrGau[Math.floor(Math.random() * arrGau.length)];
        } else if (parseInt(machineId) === 2) {
            const arrMeo = [4, 5, 6];
            toyId = arrMeo[Math.floor(Math.random() * arrMeo.length)];
        } else {
            toyId = 1;
        }
    } else {
        machine.currentToys = currentToysInDB;
    }

    // 3. GỌI SANG CON 3000 LƯU LỊCH SỬ VÀ KÍCH HOẠT TRỪ KHO THẬT TRÊN MYSQL
    try {
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        await axios.post('http://localhost:3000/api/user/history', {
            machineId: parseInt(machineId), // Ép kiểu số nguyên gửi lên
            toyId: toyId                    // Trúng con nào gửi ID con đấy lên (1-6), trượt gửi null
        }, {
            headers: { 'Authorization': formattedToken } 
        });
        console.log(` [3001] Đã bắn yêu cầu lưu lịch sử & trừ kho thật sang Core-Service. Trúng ID: ${toyId}`);
    } catch (historyError) {
        console.error(" Lỗi không lưu được lịch sử chơi hoặc trừ kho DB:", historyError.response?.data || historyError.message);
    }

    // 4. TRẢ KẾT QUẢ VỀ FRONTEND
    res.status(200).json({
        success: true,
        message: trungGau ? "Chúc mừng bạn đã gắp trúng gấu bông! " : "Hụt rồi, chúc bạn may mắn lần sau! ",
        ketQua: trungGau ? "WIN" : "LOSE",
        soGauConLaiTrongMay: machine.currentToys 
    });
};
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
   
    let currentCoinsInDB = parseInt(machine.coinsPerPlay); 

    try {
        const qtyResponse = await axios.get('http://localhost:3000/api/machines/quantities');
        if (qtyResponse.data.success) {
            const match = qtyResponse.data.data.find(q => q.id_may === parseInt(machineId));
            
        
            currentToysInDB = match ? parseInt(match.tong_so_luong || 0) : 0;
            machine.currentToys = currentToysInDB;

         
            if (match) {
                currentCoinsInDB = parseInt(match.so_xu_tren_luot || match.so_xu || match.coinsPerPlay || machine.coinsPerPlay);
                machine.coinsPerPlay = currentCoinsInDB; 
            }
        }
    } catch (err) {
        
        currentToysInDB = machine.currentToys; 
        currentCoinsInDB = machine.coinsPerPlay;
    }

    if (currentToysInDB <= 0) {
        machine.setTrangThai('Hết gấu', 'Số lượng gấu thực tế bằng 0.');
        return res.status(400).json({
            success: false,
            message: "Máy gắp này đã hết sạch gấu! Thiết bị tự động khóa để bảo trì.",
            trangThaiMay: machine.trangThai
        });
    }


    try {
        const coreResponse = await axios.post('http://localhost:3000/api/user/deduct-coins', {
           
            coinsToDeduct: currentCoinsInDB 
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

  
    let toyId = null; 
    const trungGau = Math.random() < 0.5;

    if (trungGau) {
        machine.currentToys = Math.max(0, currentToysInDB - 1);

        const mId = parseInt(machineId);
        
        
        const startToyId = (mId - 1) * 3 + 1;
        const arrQuatang = [startToyId, startToyId + 1, startToyId + 2];
        
        toyId = arrQuatang[Math.floor(Math.random() * arrQuatang.length)];
    } else {
        machine.currentToys = currentToysInDB;
    }


    try {
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        await axios.post('http://localhost:3000/api/user/history', {
            machineId: parseInt(machineId), 
            toyId: toyId                    
        }, {
            headers: { 'Authorization': formattedToken } 
        });
        console.log(`. Trúng ID: ${toyId}`);
    } catch (historyError) {
        console.error(" Lỗi không lưu được lịch sử chơi hoặc trừ kho DB:", historyError.response?.data || historyError.message);
    }

    
    if (machine.currentToys === 0) {
        machine.setTrangThai('Hết gấu', 'Người chơi đã bốc trúng con gấu cuối cùng.');
    }

    
    res.status(200).json({
        success: true,
        message: trungGau ? "Chúc mừng bạn đã gắp trúng gấu bông! " : "Hụt rồi, chúc bạn may mắn lần sau! ",
        ketQua: trungGau ? "WIN" : "LOSE",
        soGauConLaiTrongMay: machine.currentToys 
    });
};
const axios = require('axios'); // 🔥 IMPORT AXIOS ĐỂ GỌI ĐỒNG BỘ DỮ LIỆU TỪ CON 3000

class MayGapGauSubject {
    constructor(id, name, coinsPerPlay, currentToys) {
        this.id = id;
        this.name = name;
        this.coinsPerPlay = coinsPerPlay;
        this.currentToys = currentToys; // Số lượng này sẽ được cập nhật động bằng DB
        this.trangThai = 'Active'; 
        this.observers = [];       
    }

    attach(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }

    detach(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers(message) {
        this.observers.forEach(observer => {
            observer.update(message);
        });
    }

    setTrangThai(newStatus, reason) {
        this.trangThai = newStatus;
        if (newStatus === 'Sự cố' || newStatus === 'Hết gấu') {
            const msg = `CẢNH BÁO: Máy gắp [ID: ${this.id} - ${this.name}] vừa chuyển sang trạng thái [${newStatus}]. Lý do: ${reason}`;
            this.notifyObservers(msg);
        }
    }
}

// Khởi tạo mảng ban đầu (Để mặc định là 30 và 38 luôn làm dự phòng cho đẹp bro nhé)
let dsMayGap = [
    new MayGapGauSubject(1, "Máy gacha gấu ", 2, 30),
    new MayGapGauSubject(2, "Máy gacha mèo ", 4, 38)
];

// 🔥 HÀM THẦN THÁNH BỊ THIẾU: Tự động sang con 3000 lấy số lượng thật đè lên RAM
async function updateQuantitiesFromDB() {
    try {
        // Gọi API chuẩn của con 3000
        const response = await axios.get('http://localhost:3000/api/machines/quantities');
        
        if (response.data.success) {
            const quantities = response.data.data; // Mảng chứa [{id_may: 1, tong_so_luong: 30}, ...]
            
            dsMayGap.forEach(machine => {
                const dbMatch = quantities.find(q => q.id_may === machine.id);
                if (dbMatch) {
                    machine.currentToys = parseInt(dbMatch.tong_so_luong || 0);
                    console.log(` [Model 3001] Đã nạp động số lượng máy ${machine.id}: ${machine.currentToys} con`);
                }
            });
        }
    } catch (err) {
        console.error("⚠️ Không kết nối được con 3000, giữ nguyên RAM dự phòng:", err.message);
    }
}

// Gọi thực thi luôn khi server load file model này lần đầu tiên
updateQuantitiesFromDB();

// Cứ mỗi 10 giây tự động chạy ngầm đồng bộ lại từ MySQL về RAM
setInterval(updateQuantitiesFromDB, 10000);

// Xuất bản theo kiểu CommonJS
module.exports = {
    MayGapGauSubject,
    dsMayGap
};
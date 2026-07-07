const axios = require('axios'); 

class MayGapGauSubject {
   
    constructor(id, name, coinsPerPlay, currentToys, realGauIds = []) {
        this.id = id;
        this.name = name;
        this.coinsPerPlay = coinsPerPlay;
        this.currentToys = currentToys; 
        this.realGauIds = realGauIds; 
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


let dsMayGap = [];

async function updateQuantitiesFromDB() {
    try {
        const response = await axios.get('http://localhost:3000/api/machines/quantities');
        
        if (response.data.success) {
            const quantities = response.data.data; 
            
            quantities.forEach(dbItem => {
                let machine = dsMayGap.find(m => m.id === dbItem.id_may);
                
                let name = dbItem.ten_may || (dbItem.id_may === 1 ? "Máy gacha gấu" : dbItem.id_may === 2 ? "Máy gacha mèo" : `Máy gắp Pro #${dbItem.id_may}`);
                let cost = parseInt(dbItem.so_xu_tren_luot || (dbItem.id_may === 2 ? 8 : 2));
                let toys = parseInt(dbItem.tong_so_luong || 0);

            
                let listGauIds = dbItem.danh_sach_id_gau ? dbItem.danh_sach_id_gau.split(',').map(Number) : [];

                if (!machine) {
                    // Nạp mảng ID gấu thật khi khởi tạo máy mới
                    machine = new MayGapGauSubject(dbItem.id_may, name, cost, toys, listGauIds);
                    dsMayGap.push(machine);
                    console.log(`ID: ${machine.id} [${machine.name}] - Đã nạp danh sách gấu:`, listGauIds);
                } else {
                    machine.currentToys = toys;
                    machine.coinsPerPlay = cost;
                    machine.name = name;
                    
                 
                    machine.realGauIds = listGauIds;
                }
            });

            const dbIds = quantities.map(q => q.id_may);
            dsMayGap = dsMayGap.filter(m => dbIds.includes(m.id));

            console.log(` Đã đồng bộ ${dsMayGap.length} máy (Kèm mảng ID gấu động) vào RAM.`);
        }
    } catch (err) {
        console.error(" Không kết nối được 3000", err.message);
    }
}

updateQuantitiesFromDB();

setInterval(updateQuantitiesFromDB, 10000);

module.exports = {
    MayGapGauSubject,
    dsMayGap
};
const { dsMayGap, MayGapGauSubject } = require('../models/machine.model');
const { nhanVienKyThuat, nhanVienQuanLy } = require('../patterns/concreteStaff');
const axios = require('axios');


exports.getMachines = async (req, res) => {
    try {
      
        const response = await axios.get('http://localhost:3000/api/machines/quantities');
        
        if (response.data.success) {
            const quantities = response.data.data;
            
            quantities.forEach(dbItem => {
                let machine = dsMayGap.find(m => m.id === dbItem.id_may);
                
             
                let name = dbItem.ten_may || (dbItem.id_may === 1 ? "Máy gacha gấu" : dbItem.id_may === 2 ? "Máy gacha mèo" : `Máy gắp Pro #${dbItem.id_may}`);
                let cost = parseInt(dbItem.so_xu_tren_luot || (dbItem.id_may === 2 ? 4 : 2));
                let toys = parseInt(dbItem.tong_so_luong || 0);

                if (machine) {
                
                    machine.currentToys = toys;
                    machine.coinsPerPlay = cost;
                    machine.name = name;
                } else {
              
                    machine = new MayGapGauSubject(dbItem.id_may, name, cost, toys);
                    machine.attach(nhanVienKyThuat);
                    machine.attach(nhanVienQuanLy);
                    dsMayGap.push(machine);
                }
            });
        }
    } catch (err) {
        console.error("loi", err.message);
    }

  
    res.status(200).json({ success: true, data: dsMayGap });
};

exports.createMachine = (req, res) => {
    const { name, coinsPerPlay, currentToys } = req.body;
    const newId = dsMayGap.length + 1;
    const newMachine = new MayGapGauSubject(newId, name, coinsPerPlay, currentToys);
    
    newMachine.attach(nhanVienKyThuat);
    newMachine.attach(nhanVienQuanLy);
    
    dsMayGap.push(newMachine);
    res.status(201).json({ success: true, message: "Thêm máy mới thành công", data: newMachine });
};

exports.updateMachine = (req, res) => {
    const { id } = req.params;
    const { name, coinsPerPlay } = req.body;
    const machine = dsMayGap.find(m => m.id === parseInt(id));
    
    if (!machine) return res.status(404).json({ success: false, message: "Không tìm thấy máy!" });

    if (name) machine.name = name;
    if (coinsPerPlay) machine.coinsPerPlay = coinsPerPlay;

    res.status(200).json({ success: true, message: "Sửa thông tin máy thành công", data: machine });
};

exports.deleteMachine = (req, res) => {
    const { id } = req.params;
    const index = dsMayGap.findIndex(m => m.id === parseInt(id));
    
    if (index === -1) return res.status(404).json({ success: false, message: "Không tìm thấy máy!" });

    dsMayGap.splice(index, 1);
    res.status(200).json({ success: true, message: "Xóa máy thành công" });
};
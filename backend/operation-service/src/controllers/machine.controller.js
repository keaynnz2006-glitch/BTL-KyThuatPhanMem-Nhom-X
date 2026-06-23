const { dsMayGap, MayGapGauSubject } = require('../models/machine.model');
const { nhanVienKyThuat, nhanVienQuanLy } = require('../patterns/concreteStaff');

exports.getMachines = (req, res) => {
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
const { khoGauBong } = require('../models/stock.model');

exports.getToys = (req, res) => {
    res.status(200).json({ success: true, data: khoGauBong });
};

exports.updateToyQuantity = (req, res) => {
    const { id } = req.params;
    const { soLuongMoi } = req.body;
    const toy = khoGauBong.find(t => t.id === parseInt(id));
    
    if (!toy) return res.status(404).json({ success: false, message: "Không tìm thấy gấu trong kho!" });

    toy.soLuongKhoTong = parseInt(soLuongMoi);
    res.status(200).json({ success: true, message: "Cập nhật kho tổng thành công", data: toy });
};
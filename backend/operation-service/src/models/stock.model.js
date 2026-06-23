class ToyStock {
    constructor(id, name, pointsValue, soLuongKhoTong) {
        this.id = id;
        this.name = name;
        this.pointsValue = pointsValue;
        this.soLuongKhoTong = soLuongKhoTong;
    }
}

let khoGauBong = [
    new ToyStock(101, "Gấu bông Pikachu", 10, 100),
    new ToyStock(102, "Gấu bông Lotso", 15, 50)
];

module.exports = {
    ToyStock,
    khoGauBong
};

const { CoinContext } = require('../strategies/coinPromotion');

describe(' UNIT TEST: KIỂM THỬ HOẠT ĐỘNG CỦA STRATEGY PATTERN TÍNH XU KHUYẾN MÃI', () => {
    let context;

    beforeEach(() => {
        context = new CoinContext();
    });

    test('Test Case 1: Giả lập nạp ngày thường (Tỷ lệ gốc 1,000 VND = 1 xu)', () => {
        context.setStrategyByDate('2026-06-24'); // Thứ Tư
        const coins = context.executeStrategy(100000); // 100,000 VND
        expect(coins).toBe(100); // Phải ra đúng 100 xu gốc
    });

    test('Test Case 2: Giả lập nạp ngày Cuối Tuần (Được khuyến mãi cộng thêm 10%)', () => {
        context.setStrategyByDate('2026-06-28'); // Chủ Nhật
        const coins = context.executeStrategy(100000);
        expect(coins).toBe(110); // 100 xu gốc + 10% = 110 xu
    });

    test('Test Case 3: Giả lập nạp ngày Lễ Tết (Được khuyến mãi cộng thêm 20%)', () => {
        context.setStrategyByDate('2026-09-02'); // Ngày Quốc Khánh 2/9
        const coins = context.executeStrategy(100000); 
        expect(coins).toBe(120); // 100 xu gốc + 20% = 120 xu
    });
});
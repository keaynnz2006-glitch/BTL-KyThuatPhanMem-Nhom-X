// Tỷ lệ quy đổi gốc: 1,000 VND = 1 Xu
const BASE_RATE = 0.001; 

// Các Chiến lược cụ thể (Concrete Strategies)
const NormalStrategy = {
    calculateCoins: (amountVnd) => Math.floor(amountVnd * BASE_RATE)
};

const WeekendStrategy = {
    calculateCoins: (amountVnd) => Math.floor((amountVnd * BASE_RATE) * 1.1) // Khuyến mãi +10% xu
};

const HolidayStrategy = {
    calculateCoins: (amountVnd) => Math.floor((amountVnd * BASE_RATE) * 1.2) // Khuyến mãi +20% xu
};

// Lớp điều hướng (Context)
class CoinContext {
    constructor() {
        this.strategy = NormalStrategy;
    }

    // Tự động kiểm tra ngày tháng để nạp chiến lược phù hợp
    setStrategyByDate(dateStr) {
        const date = dateStr ? new Date(dateStr) : new Date();
        const day = date.getDay(); // 0: Chủ Nhật, 6: Thứ Bảy
        const month = date.getMonth() + 1;
        const dayOfMonth = date.getDate();

        // Danh sách các ngày lễ cố định (Ví dụ: 1/1, 30/4, 1/5, 2/9)
        const holidays = ['1-1', '30-4', '1-5', '2-9'];
        const currentKey = `${dayOfMonth}-${month}`;

        if (holidays.includes(currentKey)) {
            this.strategy = HolidayStrategy;
        } else if (day === 0 || day === 6) {
            this.strategy = WeekendStrategy;
        } else {
            this.strategy = NormalStrategy;
        }
    }

    executeStrategy(amountVnd) {
        return this.strategy.calculateCoins(amountVnd);
    }
}

module.exports = { CoinContext, NormalStrategy, WeekendStrategy, HolidayStrategy };
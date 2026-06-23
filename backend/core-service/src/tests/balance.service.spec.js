const balanceService = require('../services/balance.service');

jest.mock('../config/database', () => ({
    poolPromise: Promise.resolve({
        request: jest.fn()
    }),
    sql: {
        Int: 'Int'
    }
}));

const { poolPromise } = require('../config/database');

describe('BalanceService Unit Test', () => {

    let mockRequest;

    beforeEach(async () => {
        jest.clearAllMocks();

        mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };

        const pool = await poolPromise;
        pool.request.mockReturnValue(mockRequest);
    });

    describe('getBalance', () => {

        test('Báo lỗi nếu không có userId', async () => {

            await expect(
                balanceService.getBalance()
            ).rejects.toThrow(
                'Không tìm thấy ID người dùng!'
            );

        });

        test('Báo lỗi nếu người dùng không tồn tại', async () => {

            mockRequest.query.mockResolvedValueOnce({
                recordset: []
            });

            await expect(
                balanceService.getBalance(999)
            ).rejects.toThrow(
                'Người dùng không tồn tại!'
            );

        });

        test('Trả về số dư của người dùng', async () => {

            mockRequest.query.mockResolvedValueOnce({
                recordset: [
                    {
                        ho_ten: 'Khổng Mai Linh',
                        so_du_xu: 50
                    }
                ]
            });

            const result = await balanceService.getBalance(1);

            expect(result.success).toBe(true);
            expect(result.fullName).toBe('Khổng Mai Linh');
            expect(result.coins).toBe(50);

        });

    });

    describe('decreaseCoins', () => {

        test('Báo lỗi nếu userId không hợp lệ', async () => {

            await expect(
                balanceService.decreaseCoins(null, 10)
            ).rejects.toThrow(
                'Không tìm thấy ID người dùng!'
            );

        });

        test('Báo lỗi nếu người dùng không tồn tại', async () => {

            mockRequest.query.mockResolvedValueOnce({
                recordset: []
            });

            await expect(
                balanceService.decreaseCoins(999, 10)
            ).rejects.toThrow(
                'Người dùng không tồn tại!'
            );

        });

        test('Báo lỗi nếu số dư không đủ', async () => {

            mockRequest.query.mockResolvedValueOnce({
                recordset: [
                    {
                        so_du_xu: 5
                    }
                ]
            });

            await expect(
                balanceService.decreaseCoins(1, 10)
            ).rejects.toThrow(
                'Số dư xu không đủ!'
            );

        });

        test('Trừ xu thành công', async () => {

            mockRequest.query
                .mockResolvedValueOnce({
                    recordset: [
                        {
                            so_du_xu: 20
                        }
                    ]
                })
                .mockResolvedValueOnce({
                    rowsAffected: [1]
                });

            const result =
                await balanceService.decreaseCoins(1, 10);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Bắt đầu!');
            expect(result.remainingCoins).toBe(10);

        });

    });

});
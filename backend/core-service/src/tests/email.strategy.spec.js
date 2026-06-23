
// Mock database
jest.mock('../config/database', () => ({
    poolPromise: Promise.resolve({
        request: jest.fn()
    }),
    sql: {
        VarChar: 'VarChar',
        NVarChar: 'NVarChar'
    }
}));

const emailAuthStrategy = require('../strategies/email.strategy');
const { poolPromise } = require('../config/database');
const bcrypt = require('bcrypt');

jest.mock('bcrypt');

describe('EmailAuthStrategy Unit Test', () => {

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

    describe('Register', () => {

        test('Báo lỗi nếu thiếu thông tin đăng ký', async () => {
            await expect(
                emailAuthStrategy.register({})
            ).rejects.toThrow(
                'Vui lòng nhập đầy đủ thông tin!'
            );
        });

        test('Báo lỗi nếu tên tài khoản đã tồn tại', async () => {

            mockRequest.query.mockResolvedValueOnce({
                recordset: [
                    { id: 1 }
                ]
            });

            await expect(
                emailAuthStrategy.register({
                    username: 'linhkhong',
                    password: '123456',
                    fullName: 'Khổng Mai Linh',
                    phone: '0987654321'
                })
            ).rejects.toThrow(
                'Tên tài khoản đã tồn tại!'
            );
        });

        test('Đăng ký thành công nếu dữ liệu hợp lệ', async () => {

            mockRequest.query
                .mockResolvedValueOnce({
                    recordset: []
                })
                .mockResolvedValueOnce({
                    rowsAffected: [1]
                });

            bcrypt.hash.mockResolvedValue(
                'hashed_password'
            );

            const result =
                await emailAuthStrategy.register({
                    username: 'linhkhong',
                    password: '123456',
                    fullName: 'Khổng Mai Linh',
                    phone: '0987654321'
                });

            expect(result.success).toBe(true);

            expect(result.message).toBe(
                'Đăng kí tài khoản khách hàng thành công!'
            );
        });
    });

    describe('Login', () => {

        test('Báo lỗi nếu thiếu thông tin đăng nhập', async () => {
            await expect(
                emailAuthStrategy.login({})
            ).rejects.toThrow(
                'Vui lòng điền đầy đủ thông tin!'
            );
        });

        test('Báo lỗi nếu tài khoản không tồn tại', async () => {

            mockRequest.query.mockResolvedValueOnce({
                recordset: []
            });

            await expect(
                emailAuthStrategy.login({
                    username: 'linhkhong',
                    password: '123456'
                })
            ).rejects.toThrow(
                'Sai thông tin đăng nhập!'
            );
        });

        test('Báo lỗi nếu mật khẩu không đúng', async () => {

            mockRequest.query.mockResolvedValueOnce({
                recordset: [
                    {
                        id: 1,
                        tai_khoan: 'linhkhong',
                        mat_khau: 'hashed_password',
                        ho_ten: 'Khổng Mai Linh',
                        vai_tro: 'KhachHang'
                    }
                ]
            });

            bcrypt.compare.mockResolvedValue(false);

            await expect(
                emailAuthStrategy.login({
                    username: 'linhkhong',
                    password: 'saimatkhau'
                })
            ).rejects.toThrow(
                'Sai thông tin đăng nhập!'
            );
        });

        test('Đăng nhập thành công nếu thông tin chính xác', async () => {

            mockRequest.query.mockResolvedValueOnce({
                recordset: [
                    {
                        id: 1,
                        tai_khoan: 'linhkhong',
                        mat_khau: 'hashed_password',
                        ho_ten: 'Khổng Mai Linh',
                        vai_tro: 'KhachHang'
                    }
                ]
            });

            bcrypt.compare.mockResolvedValue(true);

            const result =
                await emailAuthStrategy.login({
                    username: 'linhkhong',
                    password: '123456'
                });

            expect(result.success).toBe(true);

            expect(result.user).toEqual({
                id: 1,
                username: 'linhkhong',
                fullName: 'Khổng Mai Linh',
                role: 'KhachHang'
            });

            expect(result.token).toBe(
                'mock-jwt-token-cho-email'
            );
        });
    });
});
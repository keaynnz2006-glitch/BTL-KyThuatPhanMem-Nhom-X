jest.mock('../strategies/auth.factory', () => ({
    getAuthStrategy: jest.fn()
}));

const authService = require('../services/auth.service');
const authFactory = require('../strategies/auth.factory');

describe('AuthService Unit Test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Register', () => {

        test('Báo lỗi nếu thiếu type đăng kí', async () => {

            await expect(
                authService.register(null, {})
            ).rejects.toThrow(
                'Vui lòng chọn phương thức đăng kí!'
            );

        });

        test('Gọi đúng Strategy khi đăng ký', async () => {

            const mockStrategy = {
                register: jest.fn().mockResolvedValue({
                    success: true,
                    message: 'Mock OK'
                })
            };

            authFactory.getAuthStrategy.mockReturnValue(
                mockStrategy
            );

            const testData = {
                username: 'linh'
            };

            const result = await authService.register(
                'phone',
                testData
            );

            expect(
                authFactory.getAuthStrategy
            ).toHaveBeenCalledWith(
                'phone'
            );

            expect(
                mockStrategy.register
            ).toHaveBeenCalledWith(
                testData
            );

            expect(result.success).toBe(true);

        });

    });

    describe('Login', () => {

        test('Báo lỗi nếu thiếu type', async () => {

            await expect(
                authService.login(null, {})
            ).rejects.toThrow(
                'Vui lòng chọn phương thức đăng nhập!'
            );

        });

        test('Gọi đúng Strategy khi đăng nhập', async () => {

            const mockStrategy = {
                login: jest.fn().mockResolvedValue({
                    success: true,
                    token: 'mock-token-1'
                })
            };

            authFactory.getAuthStrategy.mockReturnValue(
                mockStrategy
            );

            const testData = {
                username: 'linh',
                password: '123456'
            };

            const result = await authService.login(
                'email',
                testData
            );

            expect(
                authFactory.getAuthStrategy
            ).toHaveBeenCalledWith(
                'email'
            );

            expect(
                mockStrategy.login
            ).toHaveBeenCalledWith(
                testData
            );

            expect(result.success).toBe(true);

        });

    });

});
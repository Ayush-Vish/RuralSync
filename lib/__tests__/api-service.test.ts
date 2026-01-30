import { apiService } from '../api-service';
import { vi, Mock } from 'vitest';

global.fetch = vi.fn();

describe('ApiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockResponse = (data: any, ok = true, status = 200) => {
        (global.fetch as Mock).mockResolvedValue({
            ok,
            status,
            json: async () => data,
        });
    };

    it('login calls correct endpoint', async () => {
        mockResponse({ token: '123' });
        await apiService.login('test@example.com', 'password');

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/auth/login'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', password: 'password', role: 'CLIENT' }),
            })
        );
    });

    it('getServices calls correct endpoint', async () => {
        mockResponse([]);
        await apiService.getServices();
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/client/services'),
            expect.objectContaining({
                headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            })
        );
    });

    it('searchServices constructs query string correctly', async () => {
        mockResponse([]);
        await apiService.searchServices({ q: 'test', category: 'cleaning' });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/client/search?q=test&category=cleaning'),
            expect.any(Object)
        );
    });

    it('updateProfileImage handles FormData', async () => {
        mockResponse({});
        const file = new File([''], 'test.png', { type: 'image/png' });
        await apiService.updateProfileImage(file);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/client/profile/image'),
            expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData),
            })
        );
    });

    it('handles errors correctly', async () => {
        (global.fetch as Mock).mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Bad Request' }),
        });

        await expect(apiService.login('a', 'b')).rejects.toThrow('Bad Request');
    });
});

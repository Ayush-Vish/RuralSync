import { reverseGeocode, forwardGeocode, searchPlaces, getCurrentPosition } from '../geocoding';
import { vi, Mock } from 'vitest';

global.fetch = vi.fn();

describe('geocoding', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('reverseGeocode', () => {
        it('should return null on fetch error', async () => {
            (global.fetch as Mock).mockRejectedValue(new Error('Network error'));
            const result = await reverseGeocode(1, 2);
            expect(result).toBeNull();
        });

        it('should return null on non-ok response', async () => {
            (global.fetch as Mock).mockResolvedValue({
                ok: false,
            });
            const result = await reverseGeocode(1, 2);
            expect(result).toBeNull();
        });

        it('should return null if api returns error', async () => {
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ error: 'Some error' }),
            });
            const result = await reverseGeocode(1, 2);
            expect(result).toBeNull();
        });

        it('should return formatted result on success', async () => {
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    city: 'New York',
                    state: 'NY',
                    country: 'USA',
                    displayName: 'New York, USA',
                }),
            });

            const result = await reverseGeocode(1, 2);

            expect(result).toEqual({
                city: 'new-york',
                state: 'NY',
                country: 'USA',
                displayName: 'New York, USA',
            });
            expect(global.fetch).toHaveBeenCalledWith('/api/geocode/reverse?lat=1&lng=2');
        });
    });

    describe('forwardGeocode', () => {
        it('should return coordinates on success', async () => {
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: async () => ([{ lat: 10, lng: 20 }]),
            });

            const result = await forwardGeocode('city-name');
            expect(result).toEqual({ lat: 10, lng: 20 });
            expect(global.fetch).toHaveBeenCalledWith('/api/geocode/search?q=city-name&limit=1');
        });
    });

    describe('searchPlaces', () => {
        it('should return empty array if query is short', async () => {
            const result = await searchPlaces('a');
            expect(result).toEqual([]);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should return mapped places on success', async () => {
            (global.fetch as Mock).mockResolvedValue({
                ok: true,
                json: async () => ([{
                    placeId: '123',
                    lat: 10,
                    lng: 20,
                    displayName: 'Place',
                    city: 'City',
                    state: 'State',
                    country: 'Country',
                    type: 'Type'
                }]),
            });

            const result = await searchPlaces('query');
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                placeId: '123',
                lat: 10,
                lng: 20,
                displayName: 'Place',
                city: 'City',
                state: 'State',
                country: 'Country',
                type: 'Type'
            });
        });
    });

    describe('getCurrentPosition', () => {
        const mockGeolocation = {
            getCurrentPosition: vi.fn(),
        };

        beforeAll(() => {
            Object.defineProperty(global.navigator, 'geolocation', {
                value: mockGeolocation,
                writable: true,
            });
        });

        it('should resolve with position on success', async () => {
            const mockPosition = { coords: { latitude: 10, longitude: 20 } };
            mockGeolocation.getCurrentPosition.mockImplementation((success) => success(mockPosition));

            const result = await getCurrentPosition();
            expect(result).toBe(mockPosition);
        });

        it('should reject if geolocation not supported', async () => {
            // Save original
            const originalGeolocation = global.navigator.geolocation;
            // Undefine
            Object.defineProperty(global.navigator, 'geolocation', { value: undefined, writable: true });

            await expect(getCurrentPosition()).rejects.toThrow('Geolocation not supported');

            // Restore
            Object.defineProperty(global.navigator, 'geolocation', { value: originalGeolocation, writable: true });
        });
    });
});

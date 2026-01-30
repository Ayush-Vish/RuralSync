import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocation } from '../useLocation';
import * as geocoding from '@/lib/geocoding';
import { vi, Mock } from 'vitest';

// Mock dependencies
vi.mock('@/lib/geocoding');
vi.mock('@/store/location-store', () => ({
    useLocationStore: vi.fn(),
}));
import { useLocationStore } from '@/store/location-store';

describe('useLocation', () => {
    const mockStore = {
        latitude: null,
        longitude: null,
        city: null,
        displayName: null,
        isDetecting: false,
        error: null,
        hasLocation: vi.fn(),
        getCoordinates: vi.fn(),
        setLocation: vi.fn(),
        setDetecting: vi.fn(),
        setError: vi.fn(),
        clearLocation: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useLocationStore as unknown as Mock).mockReturnValue(mockStore);
        mockStore.hasLocation.mockReturnValue(false);
    });

    it('should return initial state (server-side default)', () => {
        // Initial render might simulate server-side where isClient is false
        const { result } = renderHook(() => useLocation());

        // On first render (server), values should be null
        expect(result.current.latitude).toBeNull();
        expect(result.current.city).toBeNull();
    });

    it('should return store state after mount (client-side)', async () => {
        mockStore.latitude = 10;
        mockStore.longitude = 20;
        mockStore.city = 'Test City';

        const { result } = renderHook(() => useLocation());

        // Wait for useEffect to set isClient to true
        await waitFor(() => {
            expect(result.current.city).toBe('Test City');
        });

        expect(result.current.latitude).toBe(10);
        expect(result.current.longitude).toBe(20);
    });

    it('should handle detectLocation success', async () => {
        const { result } = renderHook(() => useLocation());

        const mockPosition = {
            coords: { latitude: 12.34, longitude: 56.78 },
        } as GeolocationPosition;

        (geocoding.getCurrentPosition as Mock).mockResolvedValue(mockPosition);
        (geocoding.reverseGeocode as Mock).mockResolvedValue({
            city: 'detected-city',
            displayName: 'Detected City',
        });

        await act(async () => {
            await result.current.detectLocation();
        });

        expect(mockStore.setDetecting).toHaveBeenCalledWith(true);
        expect(mockStore.setError).toHaveBeenCalledWith(null);
        expect(geocoding.getCurrentPosition).toHaveBeenCalled();
        expect(geocoding.reverseGeocode).toHaveBeenCalledWith(12.34, 56.78);
        expect(mockStore.setLocation).toHaveBeenCalledWith({
            latitude: 12.34,
            longitude: 56.78,
            city: 'detected-city',
            displayName: 'Detected City',
        });
        expect(mockStore.setDetecting).toHaveBeenCalledWith(false);
    });

    it('should handle detectLocation error', async () => {
        const { result } = renderHook(() => useLocation());

        (geocoding.getCurrentPosition as Mock).mockRejectedValue(new Error('Permission denied'));

        await act(async () => {
            await result.current.detectLocation();
        });

        expect(mockStore.setDetecting).toHaveBeenCalledWith(true);
        expect(mockStore.setError).toHaveBeenCalledWith('Permission denied');
        expect(mockStore.setDetecting).toHaveBeenCalledWith(false);
    });

    it('should handle setManualLocation with city provided', async () => {
        const { result } = renderHook(() => useLocation());

        await act(async () => {
            await result.current.setManualLocation(1, 2, 'manual-city', 'Manual City');
        });

        expect(mockStore.setLocation).toHaveBeenCalledWith({
            latitude: 1,
            longitude: 2,
            city: 'manual-city',
            displayName: 'Manual City',
        });
    });

    it('should handle setManualLocation without city (reverse geocode)', async () => {
        const { result } = renderHook(() => useLocation());

        (geocoding.reverseGeocode as Mock).mockResolvedValue({
            city: 'reversed-city',
            displayName: 'Reversed City',
        });

        await act(async () => {
            await result.current.setManualLocation(1, 2);
        });

        expect(geocoding.reverseGeocode).toHaveBeenCalledWith(1, 2);
        expect(mockStore.setLocation).toHaveBeenCalledWith({
            latitude: 1,
            longitude: 2,
            city: 'reversed-city',
            displayName: 'Reversed City',
        });
    });
});

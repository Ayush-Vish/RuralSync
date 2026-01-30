import { renderHook, act } from '@testing-library/react';
import { useLocationStore } from '../location-store';

describe('useLocationStore', () => {
    beforeEach(() => {
        const store = useLocationStore.getState();
        store.clearLocation(); // Reset state
        store.setDetecting(false);
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useLocationStore());
        expect(result.current.latitude).toBeNull();
        expect(result.current.city).toBeNull();
    });

    it('setLocation updates state', () => {
        const { result } = renderHook(() => useLocationStore());

        act(() => {
            result.current.setLocation({
                latitude: 10,
                longitude: 20,
                city: 'test-city',
                displayName: 'Test City',
            });
        });

        expect(result.current.latitude).toBe(10);
        expect(result.current.city).toBe('test-city');
        expect(result.current.error).toBeNull();
    });

    it('setError updates state', () => {
        const { result } = renderHook(() => useLocationStore());

        act(() => {
            result.current.setDetecting(true);
            result.current.setError('Something went wrong');
        });

        expect(result.current.error).toBe('Something went wrong');
        expect(result.current.isDetecting).toBe(false);
    });

    it('hasLocation returns correct boolean', () => {
        const { result } = renderHook(() => useLocationStore());
        expect(result.current.hasLocation()).toBe(false);

        act(() => {
            result.current.setLocation({ latitude: 1, longitude: 1 });
        });

        expect(result.current.hasLocation()).toBe(true);
    });

    it('detecting state toggles', () => {
        const { result } = renderHook(() => useLocationStore());
        act(() => result.current.setDetecting(true));
        expect(result.current.isDetecting).toBe(true);
        act(() => result.current.setDetecting(false));
        expect(result.current.isDetecting).toBe(false);
    });
});

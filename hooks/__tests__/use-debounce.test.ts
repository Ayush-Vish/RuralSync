import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';
import { vi } from 'vitest';

describe('useDebounce', () => {
    beforeAll(() => {
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));
        expect(result.current).toBe('initial');
    });

    it('should debounce value updates', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 500 },
        });

        expect(result.current).toBe('initial');

        // Update value
        rerender({ value: 'updated', delay: 500 });

        // Value should not update immediately
        expect(result.current).toBe('initial');

        // Advance timers by partial delay
        act(() => {
            vi.advanceTimersByTime(250);
        });
        expect(result.current).toBe('initial');

        // Advance timers to complete delay
        act(() => {
            vi.advanceTimersByTime(250);
        });
        expect(result.current).toBe('updated');
    });

    it('should reset timer if value changes within delay', () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: 'initial', delay: 500 },
        });

        rerender({ value: 'update1', delay: 500 });

        act(() => {
            vi.advanceTimersByTime(250);
        });
        expect(result.current).toBe('initial');

        // Change value again before timer fires
        rerender({ value: 'update2', delay: 500 });

        act(() => {
            vi.advanceTimersByTime(250);
        });
        // Should still be initial because timer reset
        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(250);
        });
        expect(result.current).toBe('update2');
    });
});

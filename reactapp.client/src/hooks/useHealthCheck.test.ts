import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHealthCheck } from '../hooks/useHealthCheck';

describe('useHealthCheck', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('returns Unknown status initially', () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(
            () => new Promise(() => { /* never resolves */ })
        );

        const { result } = renderHook(() => useHealthCheck(60_000));

        expect(result.current.status).toBe('Unknown');
        expect(result.current.checks).toEqual([]);
    });

    it('returns Healthy when fetch succeeds with healthy response', async () => {
        const healthyResponse = {
            status: 'Healthy',
            checks: [{ name: 'self', status: 'Healthy', description: 'Application is running.', duration: 0.5 }]
        };

        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(healthyResponse),
        } as Response);

        const { result } = renderHook(() => useHealthCheck(60_000));

        await waitFor(() => {
            expect(result.current.status).toBe('Healthy');
        });

        expect(result.current.checks).toHaveLength(1);
        expect(result.current.checks[0].name).toBe('self');
    });

    it('returns Unhealthy when fetch returns non-ok response', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 503,
        } as Response);

        const { result } = renderHook(() => useHealthCheck(60_000));

        await waitFor(() => {
            expect(result.current.status).toBe('Unhealthy');
        });

        expect(result.current.checks).toEqual([]);
    });

    it('returns Unhealthy when fetch throws a network error', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

        const { result } = renderHook(() => useHealthCheck(60_000));

        await waitFor(() => {
            expect(result.current.status).toBe('Unhealthy');
        });

        expect(result.current.checks).toEqual([]);
    });

    it('returns Degraded when backend reports degraded status', async () => {
        const degradedResponse = {
            status: 'Degraded',
            checks: [{ name: 'db', status: 'Degraded', description: 'Slow response', duration: 1500 }]
        };

        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(degradedResponse),
        } as Response);

        const { result } = renderHook(() => useHealthCheck(60_000));

        await waitFor(() => {
            expect(result.current.status).toBe('Degraded');
        });
    });

    it('polls at the specified interval', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: 'Healthy', checks: [] }),
        } as Response);

        renderHook(() => useHealthCheck(5_000));

        // Initial fetch
        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });

        // Advance timer by 5s — should trigger second fetch
        await vi.advanceTimersByTimeAsync(5_000);
        expect(fetchSpy).toHaveBeenCalledTimes(2);

        // Advance another 5s
        await vi.advanceTimersByTimeAsync(5_000);
        expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('cleans up interval on unmount', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: 'Healthy', checks: [] }),
        } as Response);

        const { unmount } = renderHook(() => useHealthCheck(5_000));

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });

        unmount();

        await vi.advanceTimersByTimeAsync(10_000);
        // Should still be 1 — no more calls after unmount
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
});

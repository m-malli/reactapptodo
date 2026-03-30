import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { HealthStatus } from '../components/HealthStatus';
import type { HealthReport } from '../hooks/useHealthCheck';

// Mock the hook so we control the returned report
vi.mock('../hooks/useHealthCheck', () => ({
    useHealthCheck: vi.fn(),
}));

import { useHealthCheck } from '../hooks/useHealthCheck';
const mockUseHealthCheck = vi.mocked(useHealthCheck);

function setMockReport(report: HealthReport) {
    mockUseHealthCheck.mockReturnValue(report);
}

describe('HealthStatus', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders Healthy status with green banner class', () => {
        setMockReport({
            status: 'Healthy',
            checks: [{ name: 'self', status: 'Healthy', description: 'OK', duration: 1 }],
        });

        render(<HealthStatus />);

        const banner = screen.getByRole('status');
        expect(banner).toHaveClass('health-banner', 'health-healthy');
        expect(banner).toHaveTextContent('Backend:');
        expect(banner).toHaveTextContent('Healthy');
    });

    it('renders Unhealthy status with red banner class', () => {
        setMockReport({ status: 'Unhealthy', checks: [] });

        render(<HealthStatus />);

        const banner = screen.getByRole('status');
        expect(banner).toHaveClass('health-banner', 'health-unhealthy');
        expect(banner).toHaveTextContent('Unhealthy');
    });

    it('renders Degraded status with yellow banner class', () => {
        setMockReport({
            status: 'Degraded',
            checks: [{ name: 'db', status: 'Degraded', description: 'Slow', duration: 1500 }],
        });

        render(<HealthStatus />);

        const banner = screen.getByRole('status');
        expect(banner).toHaveClass('health-banner', 'health-degraded');
    });

    it('renders Unknown status with grey banner class', () => {
        setMockReport({ status: 'Unknown', checks: [] });

        render(<HealthStatus />);

        const banner = screen.getByRole('status');
        expect(banner).toHaveClass('health-banner', 'health-unknown');
    });

    it('renders check details when checks are present', () => {
        setMockReport({
            status: 'Healthy',
            checks: [
                { name: 'self', status: 'Healthy', description: 'OK', duration: 2.7 },
                { name: 'db', status: 'Healthy', description: null, duration: 15.3 },
            ],
        });

        render(<HealthStatus />);

        expect(screen.getByText(/self: Healthy \(3 ms\)/)).toBeInTheDocument();
        expect(screen.getByText(/db: Healthy \(15 ms\)/)).toBeInTheDocument();
    });

    it('does not render list when checks array is empty', () => {
        setMockReport({ status: 'Unhealthy', checks: [] });

        render(<HealthStatus />);

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('has aria-live="polite" for accessibility', () => {
        setMockReport({ status: 'Healthy', checks: [] });

        render(<HealthStatus />);

        const banner = screen.getByRole('status');
        expect(banner).toHaveAttribute('aria-live', 'polite');
    });
});

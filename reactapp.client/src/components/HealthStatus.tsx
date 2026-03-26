import { useHealthCheck } from "../hooks/useHealthCheck";

export function HealthStatus() {
    const { status, checks } = useHealthCheck();

    const className = `health-banner health-${status.toLowerCase()}`;

    return (
        <div className={className} role="status" aria-live="polite">
            <strong>Backend:</strong> {status}
            {checks.length > 0 && (
                <ul>
                    {checks.map((c) => (
                        <li key={c.name}>
                            {c.name}: {c.status} ({c.duration.toFixed(0)} ms)
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

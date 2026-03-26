import { useEffect, useState } from "react";

export interface HealthReport {
    status: "Healthy" | "Degraded" | "Unhealthy" | "Unknown";
    checks: { name: string; status: string; description: string | null; duration: number }[];
}

export function useHealthCheck(intervalMs = 30_000): HealthReport {
    const [report, setReport] = useState<HealthReport>({ status: "Unknown", checks: [] });

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch("/health");
                if (res.ok) {
                    setReport(await res.json());
                } else {
                    setReport({ status: "Unhealthy", checks: [] });
                }
            } catch {
                setReport({ status: "Unhealthy", checks: [] });
            }
        };

        fetchHealth();
        const id = setInterval(fetchHealth, intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return report;
}

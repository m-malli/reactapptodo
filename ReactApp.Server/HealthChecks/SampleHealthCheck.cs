using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace ReactApp.Server.HealthChecks;

public class SampleHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(HealthCheckResult.Healthy("Application is running."));
    }
}

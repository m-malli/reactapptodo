using Microsoft.Extensions.Diagnostics.HealthChecks;
using ReactApp.Server.HealthChecks;
using Xunit;

namespace ReactApp.Server.Tests;

public class SampleHealthCheckTests
{
    [Fact]
    public async Task CheckHealthAsync_ReturnsHealthy()
    {
        var check = new SampleHealthCheck();
        var context = new HealthCheckContext
        {
            Registration = new HealthCheckRegistration("self", check, null, null)
        };

        var result = await check.CheckHealthAsync(context);

        Assert.Equal(HealthStatus.Healthy, result.Status);
        Assert.Equal("Application is running.", result.Description);
    }
}

using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace ReactApp.Server.Tests;

public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    [Xunit.Fact]
    public async Task GetHealth_ReturnsOk()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Xunit.Fact]
    public async Task GetHealth_ReturnsJsonContentType()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task GetHealth_ResponseContainsHealthyStatus()
    {
        var response = await _client.GetAsync("/health");
        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);

        var status = doc.RootElement.GetProperty("status").GetString();
        Assert.Equal("Healthy", status);
    }

    [Fact]
    public async Task GetHealth_ResponseContainsSelfCheck()
    {
        var response = await _client.GetAsync("/health");
        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);

        var checks = doc.RootElement.GetProperty("checks");
        Assert.True(checks.GetArrayLength() > 0);

        var firstCheck = checks[0];
        Assert.Equal("self", firstCheck.GetProperty("name").GetString());
        Assert.Equal("Healthy", firstCheck.GetProperty("status").GetString());
    }

    [Fact]
    public async Task GetHealth_ResponseContainsDuration()
    {
        var response = await _client.GetAsync("/health");
        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);

        var checks = doc.RootElement.GetProperty("checks");
        var duration = checks[0].GetProperty("duration").GetDouble();
        Assert.True(duration >= 0);
    }
}

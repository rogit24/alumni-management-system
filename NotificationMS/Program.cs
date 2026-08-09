using Microsoft.EntityFrameworkCore;
using NotificationMS.Data;
using Steeltoe.Discovery.Client;

var builder = WebApplication.CreateBuilder(args);

// Determine port
var portEnv = Environment.GetEnvironmentVariable("PORT") ?? "8087";
builder.WebHost.UseUrls($"http://*:{portEnv}");

// Configure DB Connection from SPRING_DATASOURCE environment variables
string springUrl = Environment.GetEnvironmentVariable("SPRING_DATASOURCE_URL") ?? "";
string dbUser = Environment.GetEnvironmentVariable("SPRING_DATASOURCE_USERNAME") ?? "root";
string dbPassword = Environment.GetEnvironmentVariable("SPRING_DATASOURCE_PASSWORD") ?? "manager";

string server = "localhost";
string port = "3306";
string database = "notification_db";

if (!string.IsNullOrEmpty(springUrl))
{
    try
    {
        string cleanUrl = springUrl.Replace("jdbc:mysql://", "");
        int questionMarkIndex = cleanUrl.IndexOf('?');
        if (questionMarkIndex != -1)
        {
            cleanUrl = cleanUrl.Substring(0, questionMarkIndex);
        }
        
        int slashIndex = cleanUrl.IndexOf('/');
        if (slashIndex != -1)
        {
            database = cleanUrl.Substring(slashIndex + 1);
            string hostAndPort = cleanUrl.Substring(0, slashIndex);
            int colonIndex = hostAndPort.IndexOf(':');
            if (colonIndex != -1)
            {
                server = hostAndPort.Substring(0, colonIndex);
                port = hostAndPort.Substring(colonIndex + 1);
            }
            else
            {
                server = hostAndPort;
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error parsing SPRING_DATASOURCE_URL: {ex.Message}. Using default connection details.");
    }
}

string connectionString = $"server={server};port={port};database={database};uid={dbUser};pwd={dbPassword};AllowUserVariables=True;UseAffectedRows=True";

// Register EF Core DbContext with MySQL
builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Add MVC Controllers
builder.Services.AddControllers();

// Add Swagger / OpenAPI Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register Steeltoe Eureka Discovery Client
builder.Services.AddDiscoveryClient(builder.Configuration);

var app = builder.Build();

// Enable Swagger UI in all environments for gateway aggregation
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Notification API v1");
    c.RoutePrefix = "swagger"; // Standard ASP.NET Core path: localhost:8087/swagger
});

// Eureka Swagger aggregation rewrites: map v3/api-docs expected by Gateway to local swagger json
app.MapGet("/v3/api-docs", async context =>
{
    context.Response.Redirect("/swagger/v1/swagger.json");
    await Task.CompletedTask;
});

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { Status = "UP" }));

app.UseAuthorization();
app.MapControllers();

// Apply migrations or guarantee database exists
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
    try
    {
        context.Database.EnsureCreated();
        Console.WriteLine("Database and tables verified/created successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization warning: {ex.Message}");
    }
}

app.Run();

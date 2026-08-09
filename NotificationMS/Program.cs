using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using NotificationMS.Data;
using NotificationMS.Middleware;
using NotificationMS.Services;
using Steeltoe.Discovery.Client;
using Steeltoe.Discovery.Eureka;

var builder = WebApplication.CreateBuilder(args);

// Configure Eureka ServiceUrl from environment if present
var eurekaEnvUrl = Environment.GetEnvironmentVariable("EUREKA_CLIENT_SERVICEURL_DEFAULTZONE");
if (!string.IsNullOrEmpty(eurekaEnvUrl))
{
    builder.Configuration["eureka:client:serviceUrl"] = eurekaEnvUrl;
}

// Add Steeltoe Eureka Discovery Client
builder.Services.AddServiceDiscovery(options => options.UseEureka());

// Configure Database Connection (MySQL)
var connectionString = BuildConnectionString(builder.Configuration);

// Fixed MySQL version avoids network auto-detection blocking during startup
builder.Services.AddDbContext<NotificationDbContext>(options =>
{
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 31)));
});

// Configure Services & Dependency Injection
builder.Services.AddScoped<INotificationService, NotificationService>();

// Configure Controllers & JSON serialization options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Configure OpenAPI / Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure MySQL database tables exist (creates 'notifications' table in alumni_db)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
    var dbCreator = dbContext.Database.GetService<IRelationalDatabaseCreator>();
    if (dbCreator != null)
    {
        if (!dbCreator.Exists())
        {
            dbCreator.Create();
        }
        try
        {
            dbCreator.CreateTables();
        }
        catch
        {
            // Table(s) already exist in database
        }
    }
}

// Global Exception Handler Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Configure HTTP pipeline
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger(c =>
    {
        c.RouteTemplate = "v3/api-docs";
    });
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/v3/api-docs", "Notification Service API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();

static string BuildConnectionString(IConfiguration config)
{
    var springUrl = Environment.GetEnvironmentVariable("SPRING_DATASOURCE_URL");
    var springUser = Environment.GetEnvironmentVariable("SPRING_DATASOURCE_USERNAME") ?? "root";
    var springPwd = Environment.GetEnvironmentVariable("SPRING_DATASOURCE_PASSWORD") ?? "Naveen12";

    if (!string.IsNullOrEmpty(springUrl))
    {
        string host = "localhost";
        string db = "alumni_db";
        try
        {
            var cleanUrl = springUrl.Replace("jdbc:mysql:replication://", "").Replace("jdbc:mysql://", "");
            var parts = cleanUrl.Split('/');
            if (parts.Length > 0)
            {
                var hosts = parts[0].Split(',')[0].Split('?')[0];
                host = hosts.Split(':')[0];
            }
            if (parts.Length > 1)
            {
                db = parts[1].Split('?')[0];
            }
        }
        catch { }
        return $"Server={host};Port=3306;Database={db};Uid={springUser};Pwd={springPwd};";
    }

    return config.GetConnectionString("DefaultConnection") 
        ?? "Server=localhost;Port=3306;Database=alumni_db;Uid=root;Pwd=Naveen12;";
}

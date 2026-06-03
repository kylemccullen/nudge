using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Nudge.API.Interfaces;
using Nudge.API.Services;
using Nudge.Shared.Configuration;
using Nudge.Shared.Data;
using Nudge.Shared.Data.Domain;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "MyOrigins",
                      policy =>
                      {
                          policy.AllowAnyOrigin()
                                .AllowAnyMethod()
                                .AllowAnyHeader();
                      });
});

// Add services to the container
builder.Services.AddScoped<ISchedulerService, SchedulerService>();
builder.Services.AddScoped<ITasksService, TaskService>();
builder.Services.AddScoped<IDayCapacityService, DayCapacityService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IDataService, DataService>();
builder.Services.AddScoped<PasswordHasher<User>>();

var appSettings = builder.Configuration.GetSection("AppSettings").Get<AppSettings>()!;

if (string.IsNullOrWhiteSpace(appSettings.Jwt.Key))
    throw new InvalidOperationException(
        "JWT key is not configured. Set the NUDGE_JWT_SECRET environment variable.");

builder.Services.AddDbContext<NudgeDbContext>(opt =>
    opt.UseSqlite(appSettings.ConnectionStrings.NudgeDb));

builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = appSettings.Jwt.Issuer,
            ValidAudience = appSettings.Jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(appSettings.Jwt.Key!))
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<NudgeDbContext>();
    db.Database.Migrate();

    if (app.Environment.IsDevelopment())
    {
        await SeedData.Initialize(db, scope.ServiceProvider.GetRequiredService<PasswordHasher<User>>());
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("MyOrigins");

app.UseBlazorFrameworkFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();

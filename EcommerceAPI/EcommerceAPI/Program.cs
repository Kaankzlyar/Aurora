using EcommerceAPI.Data;
using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;


namespace EcommerceAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            

            // Add services to the container.
            // Listen on all interfaces for mobile access
            builder.WebHost.UseUrls("http://0.0.0.0:5270");

            builder.Services.AddCors(o =>
            {
                o.AddDefaultPolicy(p =>
                    p.AllowAnyOrigin()   // yayınlamada domain bazlı kısıtla
                     .AllowAnyHeader()
                     .AllowAnyMethod());
                     
                // Web ve mobile için spesifik policy
                o.AddPolicy("WebPolicy", p =>
                    p.WithOrigins(
                        "http://localhost:8082", 
                        "http://localhost:8081", 
                        "http://localhost:3000",
                        "http://192.168.1.142:8082",
                        "http://192.168.1.142:8081"
                    )
                     .AllowAnyHeader()
                     .AllowAnyMethod()
                     .AllowCredentials());
            });
            builder.Services.AddControllers()
                .AddJsonOptions( o=>
                {
                    o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Ecommerce API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "JWT Token giriniz: Bearer <token>"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
            });
            builder.Services.AddDbContext<AppDbContext>
        (options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // JWT signing key must be supplied via configuration: an environment
            // variable (Jwt__Key), user-secrets, or appsettings.Development.json.
            var jwtKey = builder.Configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException(
                    "Jwt:Key is not configured. Set it via an environment variable (Jwt__Key), " +
                    "user-secrets, or appsettings.Development.json.");
            }

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });



            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // CORS should be early in the pipeline
            app.UseCors();
            
            app.UseHttpsRedirection();
            
            // Static files konfigürasyonu - wwwroot klasörünü root olarak serve et
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")),
                RequestPath = ""
            });

            // IMPORTANT: Authentication must come before Authorization
            app.UseAuthentication();
            app.UseAuthorization();
            
            app.MapControllers();

            // Seed super admin from configuration if not exists
            SeedSuperAdmin(app.Services, app.Configuration);

            app.Run();

        }

        private static void SeedSuperAdmin(IServiceProvider services, IConfiguration configuration)
        {
            // Super-admin credentials come from configuration (env vars, user-secrets,
            // or appsettings.Development.json) — never hardcoded. Skip if not provided.
            var superAdminEmail = configuration["SuperAdmin:Email"];
            var superAdminPassword = configuration["SuperAdmin:Password"];

            if (string.IsNullOrWhiteSpace(superAdminEmail) || string.IsNullOrWhiteSpace(superAdminPassword))
            {
                Console.WriteLine("[SEEDING] SuperAdmin:Email / SuperAdmin:Password not configured — skipping super-admin seeding.");
                return;
            }

            using (var scope = services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                try
                {
                    // Check if super admin already exists
                    var existingSuperAdmin = context.Users.FirstOrDefault(u => u.Email == superAdminEmail);

                    if (existingSuperAdmin == null)
                    {
                        Console.WriteLine($"[SEEDING] Creating super admin: {superAdminEmail}");

                        var superAdmin = new EcommerceAPI.Models.User
                        {
                            Name = "Super",
                            LastName = "Admin",
                            Email = superAdminEmail,
                            PasswordHash = BCrypt.Net.BCrypt.HashPassword(superAdminPassword),
                            IsAdmin = true,
                            IsSuperAdmin = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        context.Users.Add(superAdmin);
                        context.SaveChanges();

                        Console.WriteLine("✅ Super admin created successfully!");
                        Console.WriteLine("⚠️  Please change the seeded password after first login!");
                    }
                    else
                    {
                        // Update existing user to super admin if needed
                        if (!existingSuperAdmin.IsSuperAdmin)
                        {
                            existingSuperAdmin.IsSuperAdmin = true;
                            existingSuperAdmin.IsAdmin = true;
                            context.SaveChanges();
                            Console.WriteLine($"✅ Existing user {superAdminEmail} promoted to super admin!");
                        }
                        else
                        {
                            Console.WriteLine($"✅ Super admin {superAdminEmail} already exists");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error seeding super admin: {ex.Message}");
                }
            }
        }
    }
}
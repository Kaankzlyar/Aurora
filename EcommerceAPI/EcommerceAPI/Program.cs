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

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "default-secret-key-12345")
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

            // Seed super admin (Kaan Kızılyar) if not exists
            SeedSuperAdmin(app.Services);

            app.Run();

        }

        private static void SeedSuperAdmin(IServiceProvider services)
        {
            using (var scope = services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                
                const string SUPER_ADMIN_EMAIL = "kaankizilyar2@gmail.com";
                const string SUPER_ADMIN_PASSWORD = "kutay2003"; // Varsayılan şifre, değiştirilebilir
                
                try
                {
                    // Check if super admin already exists
                    var existingSuperAdmin = context.Users.FirstOrDefault(u => u.Email == SUPER_ADMIN_EMAIL);
                    
                    if (existingSuperAdmin == null)
                    {
                        Console.WriteLine("[SEEDING] Creating super admin: Kaan Kızılyar");
                        
                        var superAdmin = new EcommerceAPI.Models.User
                        {
                            Name = "Kaan",
                            LastName = "Kızılyar",
                            Email = SUPER_ADMIN_EMAIL,
                            PasswordHash = BCrypt.Net.BCrypt.HashPassword(SUPER_ADMIN_PASSWORD),
                            IsAdmin = true,
                            IsSuperAdmin = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        
                        context.Users.Add(superAdmin);
                        context.SaveChanges();
                        
                        Console.WriteLine($"✅ Super admin created successfully!");
                        Console.WriteLine($"📧 Email: {SUPER_ADMIN_EMAIL}");
                        Console.WriteLine($"🔑 Password: {SUPER_ADMIN_PASSWORD}");
                        Console.WriteLine("⚠️  Please change the password after first login!");
                    }
                    else
                    {
                        // Update existing user to super admin if needed
                        if (!existingSuperAdmin.IsSuperAdmin)
                        {
                            existingSuperAdmin.IsSuperAdmin = true;
                            existingSuperAdmin.IsAdmin = true;
                            context.SaveChanges();
                            Console.WriteLine($"✅ Existing user {SUPER_ADMIN_EMAIL} promoted to super admin!");
                        }
                        else
                        {
                            Console.WriteLine($"✅ Super admin {SUPER_ADMIN_EMAIL} already exists");
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
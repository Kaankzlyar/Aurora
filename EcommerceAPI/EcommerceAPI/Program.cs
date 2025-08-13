using EcommerceAPI.Data;
using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Swashbuckle.AspNetCore;
using Microsoft.OpenApi.Models;

namespace EcommerceAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

<<<<<<< HEAD
            builder.Services.AddControllers()
                .AddJsonOptions( o=>
                {
                    o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                });
=======
            builder.Services.AddControllers();
>>>>>>> 6e5bc13e524bf6c95a46101914a8d33bf539a831
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
<<<<<<< HEAD
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
=======
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured"))
>>>>>>> 6e5bc13e524bf6c95a46101914a8d33bf539a831
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

            app.UseHttpsRedirection();

            // IMPORTANT: Authentication must come before Authorization
            app.UseAuthentication();
            app.UseAuthorization();
            
            app.MapControllers();

            app.Run();

        }
    }
}
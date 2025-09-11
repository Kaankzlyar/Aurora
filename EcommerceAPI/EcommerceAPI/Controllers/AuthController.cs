namespace EcommerceAPI.Controllers
{
    using EcommerceAPI.Data;
    using EcommerceAPI.Dtos;
    using EcommerceAPI.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;

    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration; // Add this field


        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            try
            {
                // Debug: Raw request'i görelim
                Console.WriteLine($"🔍 LOGIN REQUEST DEBUG:");
                Console.WriteLine($"Raw request object: {System.Text.Json.JsonSerializer.Serialize(request)}");
                Console.WriteLine($"Email: '{request.Email}' (Length: {request.Email?.Length ?? 0})");
                Console.WriteLine($"Password provided: {!string.IsNullOrEmpty(request.Password)}");
                Console.WriteLine($"Password length: {request.Password?.Length ?? 0}");

                if (!ModelState.IsValid)
                {
                    Console.WriteLine("❌ ModelState is invalid");
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    Console.WriteLine("❌ Email is null or empty");
                    return BadRequest(new { message = "E-posta adresi gerekli." });
                }

                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    Console.WriteLine("❌ Password is null or empty");
                    return BadRequest(new { message = "Şifre gerekli." });
                }

                // Normalize email
                string normalizedEmail = request.Email.Trim().ToLower();
                Console.WriteLine($"Normalized email: '{normalizedEmail}'");

                // Find user
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

                if (user == null)
                {
                    Console.WriteLine($"❌ User not found for email: {normalizedEmail}");
                    return BadRequest(new { message = "E-posta adresi hatalı veya sistemde kayıtlı değil." });
                }

                Console.WriteLine($"✅ User found: {user.Name} ({user.Email})");

                // Verify password
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

                if (!isPasswordValid)
                {
                    Console.WriteLine($"❌ Password verification failed");
                    return BadRequest(new { message = "Şifre eksik veya hatalı girildi." });
                }

                Console.WriteLine($"✅ Password verified successfully");

                // Generate JWT Token
                var jwt = GenerateJwtToken(user);

                Console.WriteLine($"✅ Login successful - Token generated");

                return Ok(new
                {
                    accessToken = jwt,
                    user = new
                    {
                        id = user.Id,
                        name = user.Name,
                        lastName = user.LastName,
                        email = user.Email,
                        role = user.IsAdmin ? "admin" : "user",
                        isSuperAdmin = user.IsSuperAdmin
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ LOGIN ERROR: {ex.Message}");
                return BadRequest(new { message = "Giriş sırasında hata oluştu." });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"] ?? "default-secret-key-12345";
            var key = Encoding.UTF8.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim("IsAdmin", user.IsAdmin.ToString()),
                    new Claim("IsSuperAdmin", user.IsSuperAdmin.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }


        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] UserDto request)
        {
            try
            {
                // Geçici: ne geliyor görelim
                Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(request));
                string normalizedEmail = request.Email.Trim().ToLower();
                Console.WriteLine($"Normalized email: '{normalizedEmail}'");

                if (!ModelState.IsValid) return BadRequest(ModelState);

                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

                if (existingUser != null)
                {
                    Console.WriteLine($"❌ Email already exists: {existingUser.Email} (ID: {existingUser.Id})");
                    return BadRequest(new { message = "Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın." });
                }

                Console.WriteLine($"✅ Email is available");

                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var user = new User
                {
                    Name = request.Name,
                    LastName = request.LastName,
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    IsAdmin = false, // Artık standart kayıtlar admin değil
                    IsSuperAdmin = false, // Sadece Kaan Kızılyar super admin
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ User saved to database with ID: {user.Id}");
                
                // Generate JWT token for the new user
                var token = GenerateJwtToken(user);
                
                return Ok(new
                {
                    accessToken = token,
                    user = new
                    {
                        id = user.Id,
                        name = user.Name,
                        lastName = user.LastName,
                        email = user.Email,
                        role = user.IsAdmin ? "admin" : "user",
                        isSuperAdmin = user.IsSuperAdmin
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ REGISTER ERROR: {ex.Message}");
                return BadRequest(new { message = "Kayıt sırasında hata oluştu." });
            }
        }
    }
}

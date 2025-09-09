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
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("IsAdmin", user.IsAdmin.ToString())
            }),
                    Expires = DateTime.UtcNow.AddHours(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var jwt = tokenHandler.WriteToken(token);

                Console.WriteLine($"✅ Login successful - Token generated");

                return Ok(new { token = jwt });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ LOGIN ERROR: {ex.Message}");
                return BadRequest(new { message = "Giriş sırasında hata oluştu." });
            }
        }


        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] UserDto request)
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
                IsAdmin = true, // Admin panelinden kayıt olan kullanıcılar admin olacak
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // <-- ADD AWAIT HERE!

            Console.WriteLine($"✅ User saved to database with ID: {user.Id}");
            return Ok(new { message = "User registered successfully." });
        }
    }
}

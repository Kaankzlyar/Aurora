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

                return Ok(new { 
                    accessToken = jwt,
                    user = new 
                    {
                        id = user.Id.ToString(),
                        name = user.Name,
                        email = user.Email,
                        role = user.IsAdmin ? "admin" : "user"
                    }
                });
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
            try
            {
                Console.WriteLine($"🔍 REGISTER REQUEST DEBUG:");
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
                    IsAdmin = true, // Web admin panelinden kayıt olan kullanıcılar admin olacak
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ User saved to database with ID: {user.Id}");

                // Generate JWT Token for immediate login
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

                // Return LoginResponse format
                return Ok(new 
                { 
                    accessToken = jwt,
                    user = new 
                    {
                        id = user.Id.ToString(),
                        name = user.Name,
                        email = user.Email,
                        role = "admin"
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ REGISTER ERROR: {ex.Message}");
                return BadRequest(new { message = "Kayıt sırasında hata oluştu." });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
        {
            try
            {
                Console.WriteLine($"🔍 FORGOT PASSWORD REQUEST:");
                Console.WriteLine($"Email: '{request.Email}'");

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

                // Normalize email
                string normalizedEmail = request.Email.Trim().ToLower();
                Console.WriteLine($"Normalized email: '{normalizedEmail}'");

                // Find user
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

                if (user == null)
                {
                    Console.WriteLine($"❌ User not found for email: {normalizedEmail}");
                    // For security reasons, we don't reveal if the email exists or not
                    // Always return success message
                    return Ok(new { message = "Eğer bu e-posta adresi sistemde kayıtlı ise, şifre sıfırlama bağlantısı gönderilecektir." });
                }

                Console.WriteLine($"✅ User found: {user.Name} ({user.Email})");

                // Generate password reset token (in a real application, this should be a secure random token)
                var resetToken = Guid.NewGuid().ToString();
                var resetTokenExpiry = DateTime.UtcNow.AddHours(1); // Token expires in 1 hour

                // TODO: Store reset token in database (add PasswordResetToken and PasswordResetTokenExpiry fields to User model)
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = resetTokenExpiry;
                await _context.SaveChangesAsync();

                // TODO: Send email with reset link
                // In a real application, you would send an email here
                // For now, we'll just log the token for testing purposes
                
                Console.WriteLine($"✅ Password reset token generated: {resetToken}");
                Console.WriteLine($"✅ Token expires at: {resetTokenExpiry}");

                // TODO: Replace with actual email sending logic
                // await _emailService.SendPasswordResetEmail(user.Email, resetToken);

                return Ok(new { message = "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ FORGOT PASSWORD ERROR: {ex.Message}");
                return BadRequest(new { message = "Şifre sıfırlama talebi işlenirken hata oluştu." });
            }
        }
    }
}

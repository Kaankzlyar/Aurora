using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcommerceAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        // Super-admin email comes from configuration (SuperAdmin:Email) — never hardcoded.
        // When unset, only users with the IsSuperAdmin flag are treated as super admins.
        private readonly string SUPER_ADMIN_EMAIL;

        public AdminController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            SUPER_ADMIN_EMAIL = configuration["SuperAdmin:Email"] ?? string.Empty;
        }

        // Admin olmak için istek gönder
        [HttpPost("request-admin")]
        public async Task<IActionResult> RequestAdmin([FromBody] AdminRequestDto request)
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return BadRequest(new { message = "Kullanıcı bilgisi bulunamadı." });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                if (user == null)
                {
                    return BadRequest(new { message = "Kullanıcı bulunamadı." });
                }

                if (user.IsAdmin)
                {
                    return BadRequest(new { message = "Zaten admin statüsündesiniz." });
                }

                if (user.AdminRequestPending)
                {
                    return BadRequest(new { message = "Admin isteğiniz zaten onay bekliyor." });
                }

                // Admin isteği güncelle
                user.AdminRequested = true;
                user.AdminRequestPending = true;
                user.AdminRequestDate = DateTime.UtcNow;
                user.AdminRequestReason = request.Reason;

                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Admin request submitted by {user.Name} {user.LastName} ({user.Email})");

                return Ok(new { message = "Admin isteğiniz başarıyla gönderildi. Onay bekleniyor." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Admin request error: {ex.Message}");
                return BadRequest(new { message = "Admin isteği gönderilirken hata oluştu." });
            }
        }

        // Bekleyen admin isteklerini getir (Sadece Super Admin)
        [HttpGet("pending-requests")]
        public async Task<IActionResult> GetPendingAdminRequests()
        {
            try
            {
                // Debug: User claims'i görelim
                Console.WriteLine("=== DEBUG: User Claims ===");
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"{claim.Type}: {claim.Value}");
                }
                Console.WriteLine("=========================");

                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                
                Console.WriteLine($"🔍 GetPendingAdminRequests - User Email: '{userEmail}', User ID: '{userId}'");
                
                if (string.IsNullOrEmpty(userEmail))
                {
                    Console.WriteLine("❌ No email claim found");
                    return Unauthorized(new { message = "Kullanıcı bilgisi bulunamadı." });
                }

                var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                if (currentUser == null)
                {
                    Console.WriteLine($"❌ User not found in database: {userEmail}");
                    return Unauthorized(new { message = "Kullanıcı bulunamadı." });
                }

                Console.WriteLine($"✅ Current user found: {currentUser.Name} (IsAdmin: {currentUser.IsAdmin}, IsSuperAdmin: {currentUser.IsSuperAdmin})");

                // Sadece Super Admin erişebilir
                if (!currentUser.IsSuperAdmin && userEmail != SUPER_ADMIN_EMAIL)
                {
                    Console.WriteLine($"❌ Access denied - Not super admin");
                    return Forbid("Bu işlem için yetkiniz yok. Sadece super admin bu işlemi yapabilir.");
                }

                var pendingRequests = await _context.Users
                    .Where(u => u.AdminRequestPending == true)
                    .Select(u => new AdminRequestResponseDto
                    {
                        Id = u.Id,
                        Name = u.Name,
                        LastName = u.LastName,
                        Email = u.Email,
                        AdminRequestReason = u.AdminRequestReason,
                        AdminRequestDate = u.AdminRequestDate,
                        CreatedAt = u.CreatedAt
                    })
                    .OrderBy(u => u.AdminRequestDate)
                    .ToListAsync();

                Console.WriteLine($"✅ {pendingRequests.Count} pending admin requests retrieved by super admin");

                return Ok(pendingRequests);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Get pending requests error: {ex.Message}");
                return BadRequest(new { message = "Admin istekleri getirilirken hata oluştu." });
            }
        }

        // Admin isteğini onayla/reddet (Sadece Super Admin)
        [HttpPost("approve-request")]
        public async Task<IActionResult> ApproveAdminRequest([FromBody] ApproveAdminRequestDto request)
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "Kullanıcı bilgisi bulunamadı." });
                }

                var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Kullanıcı bulunamadı." });
                }

                // Sadece Super Admin erişebilir
                if (!currentUser.IsSuperAdmin && userEmail != SUPER_ADMIN_EMAIL)
                {
                    return Forbid("Bu işlem için yetkiniz yok. Sadece super admin bu işlemi yapabilir.");
                }

                var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);
                if (targetUser == null)
                {
                    return BadRequest(new { message = "Hedef kullanıcı bulunamadı." });
                }

                if (!targetUser.AdminRequestPending)
                {
                    return BadRequest(new { message = "Bu kullanıcının bekleyen admin isteği yok." });
                }

                if (request.Approve)
                {
                    // Onayla
                    targetUser.IsAdmin = true;
                    targetUser.AdminRequestPending = false;
                    targetUser.AdminRequested = false;
                    // NOT: IsSuperAdmin false kalıyor - sadece Kaan Kızılyar super admin

                    Console.WriteLine($"✅ Admin request APPROVED for {targetUser.Name} {targetUser.LastName} ({targetUser.Email}) by super admin");
                }
                else
                {
                    // Reddet
                    targetUser.AdminRequestPending = false;
                    targetUser.AdminRequested = false;
                    targetUser.AdminRequestReason = null;
                    targetUser.AdminRequestDate = null;

                    Console.WriteLine($"❌ Admin request REJECTED for {targetUser.Name} {targetUser.LastName} ({targetUser.Email}) by super admin");
                }

                await _context.SaveChangesAsync();

                string message = request.Approve 
                    ? $"{targetUser.Name} {targetUser.LastName} başarıyla admin yapıldı."
                    : $"{targetUser.Name} {targetUser.LastName}'ın admin isteği reddedildi.";

                return Ok(new { message = message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Approve admin request error: {ex.Message}");
                return BadRequest(new { message = "Admin isteği işlenirken hata oluştu." });
            }
        }

        // Tüm adminleri listele (Sadece Super Admin)
        [HttpGet("list-admins")]
        public async Task<IActionResult> ListAdmins()
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "Kullanıcı bilgisi bulunamadı." });
                }

                var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Kullanıcı bulunamadı." });
                }

                // Sadece Super Admin erişebilir
                if (!currentUser.IsSuperAdmin && userEmail != SUPER_ADMIN_EMAIL)
                {
                    return Forbid("Bu işlem için yetkiniz yok. Sadece super admin bu işlemi yapabilir.");
                }

                var admins = await _context.Users
                    .Where(u => u.IsAdmin == true)
                    .Select(u => new
                    {
                        Id = u.Id,
                        Name = u.Name,
                        LastName = u.LastName,
                        Email = u.Email,
                        IsSuperAdmin = u.IsSuperAdmin,
                        CreatedAt = u.CreatedAt
                    })
                    .OrderByDescending(u => u.IsSuperAdmin)
                    .ThenBy(u => u.Name)
                    .ToListAsync();

                return Ok(admins);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ List admins error: {ex.Message}");
                return BadRequest(new { message = "Admin listesi getirilirken hata oluştu." });
            }
        }

        // Admin yetkisini kaldır (Sadece Super Admin)
        [HttpPost("remove-admin/{userId}")]
        public async Task<IActionResult> RemoveAdmin(int userId)
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "Kullanıcı bilgisi bulunamadı." });
                }

                var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "Kullanıcı bulunamadı." });
                }

                // Sadece Super Admin erişebilir
                if (!currentUser.IsSuperAdmin && userEmail != SUPER_ADMIN_EMAIL)
                {
                    return Forbid("Bu işlem için yetkiniz yok. Sadece super admin bu işlemi yapabilir.");
                }

                var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (targetUser == null)
                {
                    return BadRequest(new { message = "Hedef kullanıcı bulunamadı." });
                }

                if (targetUser.IsSuperAdmin)
                {
                    return BadRequest(new { message = "Super admin'in yetkisi kaldırılamaz." });
                }

                if (!targetUser.IsAdmin)
                {
                    return BadRequest(new { message = "Bu kullanıcı zaten admin değil." });
                }

                targetUser.IsAdmin = false;
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Admin privileges removed from {targetUser.Name} {targetUser.LastName} ({targetUser.Email}) by super admin");

                return Ok(new { message = $"{targetUser.Name} {targetUser.LastName}'ın admin yetkisi kaldırıldı." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Remove admin error: {ex.Message}");
                return BadRequest(new { message = "Admin yetkisi kaldırılırken hata oluştu." });
            }
        }
    }
}

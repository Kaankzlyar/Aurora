using EcommerceAPI.Data;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Admin yetkisi gerekli
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // Dashboard istatistiklerini getir
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                Console.WriteLine("=== DASHBOARD STATS REQUEST ===");
                
                // Toplam kullanıcı sayısı (tüm kayıtlı kullanıcılar)
                var totalUsers = await _context.Users.CountAsync();
                Console.WriteLine($"📊 Total Users: {totalUsers}");

                // Aktif sipariş sayısı (Paid, Preparing, Shipped durumundaki siparişler)
                var activeOrders = await _context.Orders
                    .Where(o => o.Status == OrderStatus.Paid || 
                               o.Status == OrderStatus.Preparing || 
                               o.Status == OrderStatus.Shipped)
                    .CountAsync();
                Console.WriteLine($"📦 Active Orders: {activeOrders}");

                // Admin sayısı (IsAdmin = true olan kullanıcılar)
                var totalAdmins = await _context.Users.Where(u => u.IsAdmin == true).CountAsync();
                Console.WriteLine($"👑 Total Admins: {totalAdmins}");

                // Bekleyen admin istekleri
                var pendingAdminRequests = await _context.Users.Where(u => u.AdminRequestPending == true).CountAsync();
                Console.WriteLine($"⏳ Pending Admin Requests: {pendingAdminRequests}");

                // Toplam sipariş sayısı (ek bilgi)
                var totalOrders = await _context.Orders.CountAsync();
                Console.WriteLine($"📋 Total Orders: {totalOrders}");

                Console.WriteLine($"✅ Dashboard stats - Users: {totalUsers}, Active Orders: {activeOrders}, Total Orders: {totalOrders}, Admins: {totalAdmins}, Pending: {pendingAdminRequests}");

                return Ok(new
                {
                    totalUsers = totalUsers,
                    activeOrders = activeOrders,
                    totalOrders = totalOrders,
                    totalAdmins = totalAdmins,
                    pendingAdminRequests = pendingAdminRequests
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Dashboard stats error: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = "Dashboard verileri alınırken hata oluştu." });
            }
        }

        // Son kayıt olan kullanıcıları getir
        [HttpGet("recent-users")]
        public async Task<IActionResult> GetRecentUsers()
        {
            try
            {
                var recentUsers = await _context.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Take(5)
                    .Select(u => new
                    {
                        Id = u.Id,
                        Name = u.Name,
                        LastName = u.LastName,
                        Email = u.Email,
                        IsAdmin = u.IsAdmin,
                        CreatedAt = u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(recentUsers);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Recent users error: {ex.Message}");
                return BadRequest(new { message = "Son kullanıcılar alınırken hata oluştu." });
            }
        }
    }
}

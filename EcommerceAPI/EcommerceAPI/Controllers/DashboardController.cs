using EcommerceAPI.Data;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
<<<<<<< HEAD
using System.Globalization;
=======
>>>>>>> ffcb4278176d55c38840c162d432d16f57abc477

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
<<<<<<< HEAD

        // Günlük kayıt olan kullanıcı sayısı (son N gün)
        [HttpGet("register-chart")]
        public async Task<IActionResult> GetRegisterChart([FromQuery] int days = 90)
        {
            if (days <= 0 || days > 365) days = 90;

            // Bitiş bugün (UTC), başlangıç N gün önce (UTC)
            var endDateUtc = DateTime.UtcNow.Date;
            var startDateUtc = endDateUtc.AddDays(-days + 1);

            // İlgili aralıkta kayıt olanları çek
            var users = await _context.Users
                .Where(u => u.CreatedAt >= startDateUtc && u.CreatedAt < endDateUtc.AddDays(1))
                .Select(u => new { u.CreatedAt })
                .ToListAsync();

            // Gün bazında grupla
            var countsByDate = users
                .GroupBy(u => u.CreatedAt.Date)
                .ToDictionary(g => g.Key, g => g.Count());

            // Eksik günleri 0 ile doldur ve ISO formatlı tarih dön
            var result = Enumerable
                .Range(0, days)
                .Select(offset => startDateUtc.AddDays(offset))
                .Select(d => new
                {
                    date = d.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    count = countsByDate.TryGetValue(d, out var c) ? c : 0
                })
                .ToList();

            return Ok(result);
        }
=======
>>>>>>> ffcb4278176d55c38840c162d432d16f57abc477
    }
}

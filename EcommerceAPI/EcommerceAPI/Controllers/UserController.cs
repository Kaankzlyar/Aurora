namespace EcommerceAPI.Controllers
{
    using EcommerceAPI.Data;
    using EcommerceAPI.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using System.Security.Claims;

    [Authorize]
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var user = _context.Users.FirstOrDefault(u => u.Id.ToString() == userId);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                name = user.Name,
                lastname = user.LastName,
                email = user.Email
            });
        }

        [HttpGet("favorites")]
        public IActionResult GetFavorites()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var favorites = _context.UserFavorites
                .Include(uf => uf.Product)
                .ThenInclude(p => p.Category)
                .Include(uf => uf.Product)
                .ThenInclude(p => p.Brand)
                .Where(uf => uf.UserId.ToString() == userId)
                .Select(uf => new
                {
                    id = uf.Product.Id,
                    name = uf.Product.Name,
                    price = uf.Product.Price,
                    imagePath = uf.Product.ImagePath,
                    categoryId = uf.Product.CategoryId,
                    categoryName = uf.Product.Category.Name,
                    brandId = uf.Product.BrandId,
                    brandName = uf.Product.Brand.Name,
                    createdAt = uf.Product.CreatedAt
                })
                .ToList();

            return Ok(favorites);
        }

        [HttpPost("favorites/{productId}")]
        public IActionResult AddToFavorites(int productId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            // Ürün var mı kontrol et
            var product = _context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return NotFound("Ürün bulunamadı.");

            // Zaten favorilerde mi kontrol et
            var existingFavorite = _context.UserFavorites
                .FirstOrDefault(uf => uf.UserId.ToString() == userId && uf.ProductId == productId);

            if (existingFavorite != null)
                return BadRequest("Ürün zaten favorilerde.");

            // Favorilere ekle
            var userFavorite = new UserFavorite
            {
                UserId = int.Parse(userId),
                ProductId = productId
            };

            _context.UserFavorites.Add(userFavorite);
            _context.SaveChanges();

            return Ok(new { message = "Ürün favorilere eklendi." });
        }

        [HttpDelete("favorites/{productId}")]
        public IActionResult RemoveFromFavorites(int productId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var favorite = _context.UserFavorites
                .FirstOrDefault(uf => uf.UserId.ToString() == userId && uf.ProductId == productId);

            if (favorite == null)
                return NotFound("Favori bulunamadı.");

            _context.UserFavorites.Remove(favorite);
            _context.SaveChanges();

            return Ok(new { message = "Ürün favorilerden çıkarıldı." });
        }

        [HttpDelete("favorites")]
        public IActionResult ClearFavorites()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var favorites = _context.UserFavorites
                .Where(uf => uf.UserId.ToString() == userId)
                .ToList();

            _context.UserFavorites.RemoveRange(favorites);
            _context.SaveChanges();

            return Ok(new { message = "Tüm favoriler temizlendi." });
        }
    }
}

using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductsController(AppDbContext db) => _db = db;

    // GET /api/products?categoryId=2&brandId=5&page=1&pageSize=20
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetList(
        [FromQuery] int? categoryId,
        [FromQuery] int? brandId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var q = _db.Products.AsQueryable();

        if (categoryId.HasValue)
            q = q.Where(p => p.CategoryId == categoryId.Value);

        if (brandId.HasValue)
            q = q.Where(p => p.BrandId == brandId.Value);

        var list = await q.Include(p => p.Category)
                          .Include(p => p.Brand)
                          .OrderByDescending(p => p.CreatedAt)
                          .Skip((page - 1) * pageSize)
                          .Take(pageSize)
                          .Select(p => new ProductDto(
                              p.Id, p.Name, p.Price, p.OriginalPrice, p.DiscountPercentage,
                              p.CategoryId, p.Category.Name,
                              p.BrandId, p.Brand.Name,
                              p.Gender.ToString(),
                              p.ImagePath, p.CreatedAt, 
                              // Calculate IsOnDiscount in the projection
                              p.OriginalPrice.HasValue && p.DiscountPercentage.HasValue && p.DiscountPercentage > 0,
                              // Calculate IsNewArrival in the projection
                              EF.Functions.DateDiffDay(p.CreatedAt, DateTime.UtcNow) <= 5))
                          .ToListAsync();

        return Ok(list);
    }

    // GET /api/products/special-today - Random products with random discounts (same products for entire day)
    [HttpGet("special-today")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetSpecialToday(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5) // Default to 5 products for special today
    {
        // Create a deterministic seed based on today's date
        // This ensures the same products are special for the entire day
        var today = DateTime.Today;
        var dateString = today.ToString("yyyy-MM-dd");
        var seed = dateString.GetHashCode();
        var random = new Random(seed);

        // Get all products from database first
        var allProducts = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .ToListAsync();

        if (!allProducts.Any())
        {
            return Ok(new List<ProductDto>());
        }

        // Shuffle products using the seeded random generator
        var shuffledProducts = allProducts.OrderBy(p => random.Next()).Take(pageSize).ToList();

        // Apply random discounts to each product (also seeded for consistency)
        var specialProducts = shuffledProducts.Select((p, index) =>
        {
            // Use a different seed for each product to get different discounts
            var productSeed = seed + p.Id + index;
            var productRandom = new Random(productSeed);
            
            // Generate random discount between 5% and 20%
            var discountPercentage = productRandom.Next(5, 21); // 5-20%
            var originalPrice = p.Price;
            var discountedPrice = Math.Round(originalPrice * (100 - discountPercentage) / 100, 2);

            return new ProductDto(
                p.Id, p.Name, discountedPrice, originalPrice, discountPercentage,
                p.CategoryId, p.Category.Name,
                p.BrandId, p.Brand.Name,
                p.Gender.ToString(),
                p.ImagePath, p.CreatedAt,
                true, // IsOnDiscount = true for all special today products
                (DateTime.UtcNow - p.CreatedAt).TotalDays <= 5); // IsNewArrival calculation
        }).ToList();

        return Ok(specialProducts);
    }

    // GET /api/products/iconic-selections - Jewelry products
    [HttpGet("iconic-selections")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetIconicSelections(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        // Find jewelry category (assuming it's named "Jewelry" or similar)
        var jewelryCategory = await _db.Categories
            .FirstOrDefaultAsync(c => c.Name.ToLower().Contains("jewelry") || 
                                    c.Name.ToLower().Contains("jewellery") ||
                                    c.Name.ToLower().Contains("mücevher"));

        if (jewelryCategory == null)
        {
            return Ok(new List<ProductDto>()); // Return empty list if no jewelry category found
        }

        var list = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => p.CategoryId == jewelryCategory.Id)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto(
                p.Id, p.Name, p.Price, p.OriginalPrice, p.DiscountPercentage,
                p.CategoryId, p.Category.Name,
                p.BrandId, p.Brand.Name,
                p.Gender.ToString(),
                p.ImagePath, p.CreatedAt, 
                // Calculate IsOnDiscount in the projection
                p.OriginalPrice.HasValue && p.DiscountPercentage.HasValue && p.DiscountPercentage > 0,
                // Calculate IsNewArrival in the projection
                EF.Functions.DateDiffDay(p.CreatedAt, DateTime.UtcNow) <= 5))
            .ToListAsync();

        return Ok(list);
    }

    // GET /api/products/new-arrivals - Products added in last 5 days
    [HttpGet("new-arrivals")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetNewArrivals(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var fiveDaysAgo = DateTime.UtcNow.AddDays(-5);
        
        var list = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => p.CreatedAt >= fiveDaysAgo)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto(
                p.Id, p.Name, p.Price, p.OriginalPrice, p.DiscountPercentage,
                p.CategoryId, p.Category.Name,
                p.BrandId, p.Brand.Name,
                p.Gender.ToString(),
                p.ImagePath, p.CreatedAt, 
                // Calculate IsOnDiscount in the projection
                p.OriginalPrice.HasValue && p.DiscountPercentage.HasValue && p.DiscountPercentage > 0,
                // Calculate IsNewArrival in the projection
                EF.Functions.DateDiffDay(p.CreatedAt, DateTime.UtcNow) <= 5))
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> Get(int id)
    {
        var p = await _db.Products
            .Include(x => x.Category)
            .Include(x => x.Brand)
            .FirstOrDefaultAsync(x => x.Id == id);

        return p is null
            ? NotFound()
            : Ok(new ProductDto(
                p.Id, p.Name, p.Price, p.OriginalPrice, p.DiscountPercentage,
                p.CategoryId, p.Category.Name,
                p.BrandId, p.Brand.Name,
                p.Gender.ToString(), p.ImagePath, p.CreatedAt, 
                // Calculate IsOnDiscount
                p.OriginalPrice.HasValue && p.DiscountPercentage.HasValue && p.DiscountPercentage > 0,
                // Calculate IsNewArrival
                (DateTime.UtcNow - p.CreatedAt).TotalDays <= 5));
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
    {
        var catOk = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        var brOk = await _db.Brands.AnyAsync(b => b.Id == dto.BrandId);
        if (!catOk) return BadRequest("Geçersiz CategoryId.");
        if (!brOk) return BadRequest("Geçersiz BrandId.");

        var p = new Models.Product
        {
            Name = dto.Name.Trim(),
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            DiscountPercentage = dto.DiscountPercentage,
            CategoryId = dto.CategoryId,
            BrandId = dto.BrandId,
            Gender = Enum.Parse<Models.Product.GenderType>(dto.Gender),
            ImagePath = dto.ImagePath
        };
        _db.Products.Add(p);
        await _db.SaveChangesAsync();

        var cat = await _db.Categories.FindAsync(p.CategoryId);
        var br = await _db.Brands.FindAsync(p.BrandId);

        return CreatedAtAction(nameof(Get), new { id = p.Id },
            new ProductDto(
                p.Id, p.Name, p.Price, p.OriginalPrice, p.DiscountPercentage,
                p.CategoryId, cat!.Name,
                p.BrandId, br!.Name,
                p.Gender.ToString(), p.ImagePath, p.CreatedAt, 
                // Calculate IsOnDiscount
                p.OriginalPrice.HasValue && p.DiscountPercentage.HasValue && p.DiscountPercentage > 0,
                // Calculate IsNewArrival
                (DateTime.UtcNow - p.CreatedAt).TotalDays <= 5));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        var p = await _db.Products.FindAsync(id);
        if (p is null) return NotFound();

        var catOk = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        var brOk = await _db.Brands.AnyAsync(b => b.Id == dto.BrandId);
        if (!catOk) return BadRequest("Geçersiz CategoryId.");
        if (!brOk) return BadRequest("Geçersiz BrandId.");

        p.Name = dto.Name.Trim();
        p.Price = dto.Price;
        p.OriginalPrice = dto.OriginalPrice;
        p.DiscountPercentage = dto.DiscountPercentage;
        p.CategoryId = dto.CategoryId;
        p.BrandId = dto.BrandId;
        p.Gender = Enum.Parse<Models.Product.GenderType>(dto.Gender);
        p.ImagePath = dto.ImagePath;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.Products.FindAsync(id);
        if (p is null) return NotFound();
        _db.Products.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

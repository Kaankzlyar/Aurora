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
                              p.Id, p.Name, p.Price,
                              p.CategoryId, p.Category.Name,
                              p.BrandId, p.Brand.Name,
                              p.ImagePath))
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
                p.Id, p.Name, p.Price,
                p.CategoryId, p.Category.Name,
                p.BrandId, p.Brand.Name,
                p.ImagePath));
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
            CategoryId = dto.CategoryId,
            BrandId = dto.BrandId,
            ImagePath = dto.ImagePath
        };
        _db.Products.Add(p);
        await _db.SaveChangesAsync();

        var cat = await _db.Categories.FindAsync(p.CategoryId);
        var br = await _db.Brands.FindAsync(p.BrandId);

        return CreatedAtAction(nameof(Get), new { id = p.Id },
            new ProductDto(
                p.Id, p.Name, p.Price,
                p.CategoryId, cat!.Name,
                p.BrandId, br!.Name,
                p.ImagePath));
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
        p.CategoryId = dto.CategoryId;
        p.BrandId = dto.BrandId;
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

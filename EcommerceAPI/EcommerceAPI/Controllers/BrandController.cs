using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly AppDbContext _db;
    public BrandsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BrandDto>>> GetAll()
        => Ok(await _db.Brands
            .OrderBy(b => b.Name)
            .Select(b => new BrandDto(b.Id, b.Name, b.Slug))
            .ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BrandDto>> Get(int id)
    {
        var b = await _db.Brands.FindAsync(id);
        return b is null ? NotFound() : Ok(new BrandDto(b.Id, b.Name, b.Slug));
    }

    [HttpPost]
    public async Task<ActionResult<BrandDto>> Create(CreateBrandDto dto)
    {
        var name = dto.Name.Trim();
        if (await _db.Brands.AnyAsync(x => x.Name == name))
            return Conflict("Aynı isimde marka var.");

        var b = new Brand { Name = name, Slug = dto.Slug };
        _db.Brands.Add(b);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = b.Id }, new BrandDto(b.Id, b.Name, b.Slug));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateBrandDto dto)
    {
        var b = await _db.Brands.FindAsync(id);
        if (b is null) return NotFound();
        var name = dto.Name.Trim();

        if (await _db.Brands.AnyAsync(x => x.Id != id && x.Name == name))
            return Conflict("Aynı isimde başka bir marka var.");

        b.Name = name;
        b.Slug = dto.Slug;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var b = await _db.Brands.FindAsync(id);
        if (b is null) return NotFound();
        _db.Brands.Remove(b);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // /api/brands/{id}/products  -> markaya ait ürünler
    [HttpGet("{id:int}/products")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(int id)
    {
        var exists = await _db.Brands.AnyAsync(b => b.Id == id);
        if (!exists) return NotFound();

        var list = await _db.Products
            .Where(p => p.BrandId == id)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto(
                p.Id, p.Name, p.Price, p.OriginalPrice, p.DiscountPercentage,
                p.CategoryId, p.Category.Name,
                p.BrandId, p.Brand.Name,
                p.Gender.ToString(), p.ImagePath, p.CreatedAt, p.IsOnDiscount, p.IsNewArrival))
            .ToListAsync();

        return Ok(list);
    }
}

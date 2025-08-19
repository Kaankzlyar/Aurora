using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CategoriesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
        => Ok(await _db.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name))
            .ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> Get(int id)
    {
        var c = await _db.Categories.FindAsync(id);
        return c is null ? NotFound() : Ok(new CategoryDto(c.Id, c.Name));
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(CreateCategoryDto dto)
    {
        var c = new Category { Name = dto.Name.Trim() };
        _db.Categories.Add(c);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = c.Id }, new CategoryDto(c.Id, c.Name));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCategoryDto dto)
    {
        var c = await _db.Categories.FindAsync(id);
        if (c is null) return NotFound();
        c.Name = dto.Name.Trim();
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _db.Categories.FindAsync(id);
        if (c is null) return NotFound();
        _db.Categories.Remove(c);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // /api/categories/{id}/products  (Kategoriye göre ürünler)
    [HttpGet("{id:int}/products")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(int id)
    {
        var exists = await _db.Categories.AnyAsync(c => c.Id == id);
        if (!exists) return NotFound();

        var list = await _db.Products
            .Where(p => p.CategoryId == id)
            .Include(p => p.Category)
            .Include(p => p.Brand) // <-- eklendi
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto(
                p.Id,
                p.Name,
                p.Price,
                p.CategoryId,
                p.Category.Name,
                p.BrandId,
                p.Brand.Name,
                p.ImagePath))
            .ToListAsync();

        return Ok(list);
    }

}


using System.Security.Claims;
using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // token zorunlu
public class CartController : ControllerBase
{
    private readonly AppDbContext _db;
    public CartController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub")
                  ?? User.FindFirstValue("uid");

        if (!int.TryParse(idStr, out var id))
            throw new Exception("Invalid user id claim.");
        return id;
    }

    // GET /api/cart
    [HttpGet]
    public async Task<ActionResult<CartSummaryDto>> GetMyCart()
    {
        var userId = GetUserId();

        var items = await _db.CartItems
            .Where(ci => ci.UserId == userId)
            .Include(ci => ci.Product)
            .Select(ci => new CartItemDto(
                ci.ProductId,
                ci.Product.Name,
                ci.Product.Price,
                ci.Product.ImagePath,
                ci.Quantity,
                ci.Product.Price * ci.Quantity))
            .ToListAsync();

        var totalQty = items.Sum(i => i.Quantity);
        var subtotal = items.Sum(i => i.LineTotal);

        return Ok(new CartSummaryDto(items, totalQty, subtotal));
    }

    // POST /api/cart/items  body: { productId, quantity }
    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemDto dto)
    {
        var userId = GetUserId();

        var product = await _db.Products.FindAsync(dto.ProductId);
        if (product is null) return BadRequest("Geçersiz ürün.");

        var existing = await _db.CartItems
            .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == dto.ProductId);

        var qty = Math.Max(1, dto.Quantity);

        if (existing is null)
        {
            _db.CartItems.Add(new Models.CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = qty
            });
        }
        else
        {
            existing.Quantity += qty;
        }
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PUT /api/cart/items/{productId}  body: { quantity }
    [HttpPut("items/{productId:int}")]
    public async Task<IActionResult> UpdateItem(int productId, UpdateCartItemDto dto)
    {
        var userId = GetUserId();
        var item = await _db.CartItems
            .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);
        if (item is null) return NotFound();

        if (dto.Quantity <= 0)
            _db.CartItems.Remove(item);
        else
            item.Quantity = dto.Quantity;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/cart/items/{productId}
    [HttpDelete("items/{productId:int}")]
    public async Task<IActionResult> RemoveItem(int productId)
    {
        var userId = GetUserId();
        var item = await _db.CartItems
            .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);
        if (item is null) return NotFound();

        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/cart  -> sepeti tamamen temizle
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();
        var items = _db.CartItems.Where(ci => ci.UserId == userId);
        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

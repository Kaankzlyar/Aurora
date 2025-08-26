using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using EcommerceAPI;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db){ _db = db; }

    [HttpPost("checkout")]
    public async Task<ActionResult<OrderDto>> Checkout(CheckoutRequest req)
    {
        int uid = User.GetUserId();

        // 1) Adres doğrula (kullanıcıya ait olmalı)
        var a = await _db.Addresses.FirstOrDefaultAsync(x => x.Id == req.AddressId && x.UserId == uid);
        if (a is null) return BadRequest("Adres bulunamadı.");

        // 2) Kart doğrula (kullanıcıya ait olmalı) — burada gerçek ödeme simüle
        var card = await _db.Cards.FirstOrDefaultAsync(x => x.Id == req.CardId && x.UserId == uid);
        if (card is null) return BadRequest("Kart bulunamadı.");

        // 3) Sepeti çek
        var items = await _db.CartItems
            .Include(ci => ci.Product)
            .Where(ci => ci.UserId == uid)
            .ToListAsync();
        if (items.Count == 0) return BadRequest("Sepet boş.");

        // 4) Tutarları hesapla
        decimal subtotal = items.Sum(i => i.Product.Price * i.Quantity);
        decimal shipping = 0; // koşula göre hesaplanabilir
        decimal total = subtotal + shipping;

        // 5) Sipariş oluştur + kalemleri kopyala
        var order = new Order {
            UserId = uid, Subtotal = subtotal, ShippingFee = shipping, GrandTotal = total,
            Note = req.Note, Status = OrderStatus.Paid, CreatedAt = DateTime.UtcNow, PaidAt = DateTime.UtcNow,
            AddressId = a.Id,
            ShipCountry = a.Country, ShipCity = a.City, ShipDistrict = a.District,
            ShipNeighborhood = a.Neighborhood, ShipStreet = a.Street, ShipBuildingNo = a.BuildingNo,
            ShipApartmentNo = a.ApartmentNo, ShipPostalCode = a.PostalCode, ShipLine2 = a.Line2, ShipContactPhone = a.ContactPhone
        };

        foreach (var it in items)
        {
            order.Items.Add(new OrderItem {
                ProductId = it.ProductId,
                ProductName = it.Product.Name,
                ProductImagePath = it.Product.ImagePath,
                UnitPrice = it.Product.Price,
                Quantity = it.Quantity,
                LineTotal = it.Product.Price * it.Quantity
            });
        }

        _db.Orders.Add(order);

        // 6) Sepeti temizle
        _db.CartItems.RemoveRange(items);

        await _db.SaveChangesAsync();

        var dto = new OrderDto(
            order.Id, order.Status, order.Subtotal, order.ShippingFee, order.GrandTotal, order.CreatedAt,
            order.Items.Select(x => new OrderItemDto(x.ProductId, x.ProductName, x.ProductImagePath, x.UnitPrice, x.Quantity, x.LineTotal))
        );
        return Ok(dto);
    }

    // “Siparişlerim” listesi
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> MyOrders()
    {
        int uid = User.GetUserId();
        var orders = await _db.Orders
            .Where(o => o.UserId == uid)
            .OrderByDescending(o => o.Id)
            .Include(o => o.Items)
            .ToListAsync();

        var list = orders.Select(o => new OrderDto(
            o.Id, o.Status, o.Subtotal, o.ShippingFee, o.GrandTotal, o.CreatedAt,
            o.Items.Select(x => new OrderItemDto(x.ProductId, x.ProductName, x.ProductImagePath, x.UnitPrice, x.Quantity, x.LineTotal))
        ));
        return Ok(list);
    }

    // Tekil sipariş (detay)
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> Get(int id)
    {
        int uid = User.GetUserId();
        var o = await _db.Orders.Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid);
        if (o is null) return NotFound();

        var dto = new OrderDto(
            o.Id, o.Status, o.Subtotal, o.ShippingFee, o.GrandTotal, o.CreatedAt,
            o.Items.Select(x => new OrderItemDto(x.ProductId, x.ProductName, x.ProductImagePath, x.UnitPrice, x.Quantity, x.LineTotal))
        );
        return Ok(dto);
    }

    // (Opsiyonel) Admin sipariş durumu güncelleme
    [HttpPost("{id:int}/status")]
    [Authorize(Roles="Admin")]
    public async Task<IActionResult> SetStatus(int id, OrderStatus status)
    {
        var o = await _db.Orders.FirstOrDefaultAsync(x => x.Id == id);
        if (o is null) return NotFound();
        o.Status = status;
        if (status == OrderStatus.Shipped) o.ShippedAt = DateTime.UtcNow;
        if (status == OrderStatus.Delivered) o.DeliveredAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;
using EcommerceAPI;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CardsController : ControllerBase
{
    private readonly AppDbContext _db;
    public CardsController(AppDbContext db){ _db = db; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CardDto>>> GetMy()
    {
        int uid = User.GetUserId();
        var list = await _db.Cards.Where(c => c.UserId == uid)
            .OrderByDescending(c => c.Id)
            .Select(c => new CardDto(c.Id, c.HolderName, c.Brand, c.Last4, c.ExpMonth, c.ExpYear))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<CardDto>> Create(CreateCardDto dto)
    {
        int uid = User.GetUserId();

        // PAN/CVV doğrulama (saklanmayacak!)
        if (!IsValidPan(dto.Pan)) return BadRequest("Kart numarası geçersiz.");
        if (dto.Cvv.Length < 3 || dto.Cvv.Length > 4) return BadRequest("CVV geçersiz.");
        if (dto.ExpMonth < 1 || dto.ExpMonth > 12) return BadRequest("SKT ay geçersiz.");
        if (dto.ExpYear < DateTime.UtcNow.Year || dto.ExpYear > DateTime.UtcNow.Year + 20) return BadRequest("SKT yıl geçersiz.");

        var brand = DetectBrand(dto.Pan);
        var last4 = dto.Pan[^4..];

        // ÜRETİMDE: payment gateway’e gidip token al → GatewayToken’a yaz
        var c = new CardOnFile {
            UserId = uid, HolderName = dto.HolderName.Trim(),
            Brand = brand, Last4 = last4, ExpMonth = dto.ExpMonth, ExpYear = dto.ExpYear,
            GatewayToken = null
        };
        _db.Cards.Add(c);
        await _db.SaveChangesAsync();

        var res = new CardDto(c.Id, c.HolderName, c.Brand, c.Last4, c.ExpMonth, c.ExpYear);
        return CreatedAtAction(nameof(GetMy), new { id = c.Id }, res);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCardDto dto)
    {
        int userid = User.GetUserId();
        var c = await _db.Cards.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userid);
        if (c is null) return NotFound();

        // Validasyon
        if (dto.ExpMonth < 1 || dto.ExpMonth > 12) return BadRequest("SKT ay geçersiz.");
        if (dto.ExpYear < DateTime.UtcNow.Year || dto.ExpYear > DateTime.UtcNow.Year + 20) return BadRequest("SKT yıl geçersiz.");

        // Sadece güncellenebilir alanları güncelle
        c.HolderName = dto.HolderName.Trim();
        c.ExpMonth = dto.ExpMonth;
        c.ExpYear = dto.ExpYear;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        int uid = User.GetUserId();
        var c = await _db.Cards.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid);
        if (c is null) return NotFound();
        _db.Cards.Remove(c);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ---- helpers ----
    private static bool IsValidPan(string pan)
    {
        var digits = Regex.Replace(pan, @"\D", "");
        // Luhn
        int sum=0; bool alt=false;
        for (int i = digits.Length-1; i >= 0; i--){
            int d = digits[i]-'0';
            if (alt){ d*=2; if (d>9)d-=9; }
            sum+=d; alt=!alt;
        }
        return sum % 10 == 0 && digits.Length is >= 12 and <= 19;
    }
    private static string DetectBrand(string pan)
    {
        if (Regex.IsMatch(pan, @"^4")) return "VISA";
        if (Regex.IsMatch(pan, @"^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))")) return "MASTERCARD";
        if (Regex.IsMatch(pan, @"^3[47]")) return "AMEX";
        return "CARD";
    }
}

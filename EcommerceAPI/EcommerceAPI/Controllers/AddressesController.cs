using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using EcommerceAPI;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _db;
    public AddressesController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AddressDto>>> GetMy()
    {
        int uid = User.GetUserId();
        var list = await _db.Addresses.Where(a => a.UserId == uid)
            .OrderByDescending(a => a.Id)
            .Select(a => new AddressDto(a.Id, a.Title, a.Country, a.City, a.District,
                     a.Neighborhood, a.Street, a.BuildingNo, a.ApartmentNo, a.PostalCode, a.Line2, a.ContactPhone))
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<AddressDto>> Create(CreateAddressDto dto)
    {
        int uid = User.GetUserId();
        var a = new Address {
            UserId = uid, Title = dto.Title, Country = dto.Country, City = dto.City, District = dto.District,
            Neighborhood = dto.Neighborhood, Street = dto.Street, BuildingNo = dto.BuildingNo,
            ApartmentNo = dto.ApartmentNo, PostalCode = dto.PostalCode, Line2 = dto.Line2, ContactPhone = dto.ContactPhone
        };
        _db.Addresses.Add(a);
        await _db.SaveChangesAsync();
        var res = new AddressDto(a.Id, a.Title, a.Country, a.City, a.District, a.Neighborhood, a.Street, a.BuildingNo, a.ApartmentNo, a.PostalCode, a.Line2, a.ContactPhone);
        return CreatedAtAction(nameof(GetMy), new { id = a.Id }, res);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateAddressDto dto)
    {
        int uid = User.GetUserId();
        var a = await _db.Addresses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid);
        if (a is null) return NotFound();

        a.Title = dto.Title; a.Country = dto.Country; a.City = dto.City; a.District = dto.District;
        a.Neighborhood = dto.Neighborhood; a.Street = dto.Street; a.BuildingNo = dto.BuildingNo;
        a.ApartmentNo = dto.ApartmentNo; a.PostalCode = dto.PostalCode; a.Line2 = dto.Line2; a.ContactPhone = dto.ContactPhone;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        int uid = User.GetUserId();
        var a = await _db.Addresses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid);
        if (a is null) return NotFound();
        _db.Addresses.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

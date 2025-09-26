namespace EcommerceAPI.Models;

public class Address
{
    public int Id { get; set; }
    public int UserId { get; set; }                 // adres sahibinin User Id’si
    public string Title { get; set; } = "Ev";       // kullanıcıya görünen başlık (Ev, Ofis vs)
    public string Country { get; set; } = "Türkiye";
    public string City { get; set; } = default!;
    public string District { get; set; } = default!;     // ilçe
    public string Neighborhood { get; set; } = default!; // mahalle
    public string Street { get; set; } = default!;       // sokak/cadde
    public string BuildingNo { get; set; } = default!;   // bina no
    public string? ApartmentNo { get; set; }             // daire no (ops.)
    public string? PostalCode { get; set; }
    public string? Line2 { get; set; }                   // ek satır (site adı vs)
    public string? ContactPhone { get; set; }            // teslimat telefonu (ops.)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

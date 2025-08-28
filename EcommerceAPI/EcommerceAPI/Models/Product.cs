namespace EcommerceAPI.Models;

public class Product
{
    public enum GenderType : byte {
        Unspecified = 0,
        Men = 1,
        Women = 2,
        Unisex = 3
    }
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public decimal Price { get; set; }
    public string? ImagePath { get; set; }

    // Kategori (önceden vardı)
    public int CategoryId { get; set; }
    public Category Category { get; set; } = default!;

    // MARKA (yeni)
    public int BrandId { get; set; }
    public Brand Brand { get; set; } = default!;

    public GenderType Gender { get; set; } = GenderType.Unisex;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

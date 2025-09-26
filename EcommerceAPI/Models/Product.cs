namespace EcommerceAPI.Models;

public class Product
{
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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

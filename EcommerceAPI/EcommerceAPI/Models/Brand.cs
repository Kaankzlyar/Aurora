namespace EcommerceAPI.Models;

public class Brand
{
    public int Id { get; set; }
    public string Name { get; set; } = default!; // Örn: "Tom Ford"
    public string? Slug { get; set; }            // Örn: "tom-ford" (opsiyonel)

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

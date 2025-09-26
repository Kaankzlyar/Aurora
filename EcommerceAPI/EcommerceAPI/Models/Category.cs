namespace EcommerceAPI.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Slug { get; set; }   // <-- eklendi

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

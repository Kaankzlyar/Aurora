namespace EcommerceAPI.Models;

public class CartItem
{
    public int Id { get; set; }

    // Kullanıcıya özel sepet
    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public int Quantity { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

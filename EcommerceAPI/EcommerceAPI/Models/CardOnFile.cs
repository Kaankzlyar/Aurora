namespace EcommerceAPI.Models;

public class CardOnFile
{
    public int Id { get; set; }
    public int UserId { get; set; }             // kart sahibi kullanıcı
    public string HolderName { get; set; } = default!;
    public string Brand { get; set; } = default!;   // Visa/Mastercard vs
    public string Last4 { get; set; } = default!;   // yalnızca son 4
    public int ExpMonth { get; set; }
    public int ExpYear { get; set; }
    public string? GatewayToken { get; set; }       // stripe/iyzico token (ops.)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // DİKKAT: PAN/CVV burada YOK — asla saklamıyoruz
}

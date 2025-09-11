namespace EcommerceAPI.Models;

public enum OrderStatus { Pending=0, Paid=1, Preparing=2, Shipped=3, Delivered=4, Canceled=5 }

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; } // Navigation property

    // Toplamlar
    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal GrandTotal { get; set; }

    // Durum ve zamanlar
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public string? Note { get; set; }
    public string? CancellationReason { get; set; }

    // Gönderim adresi SNAPSHOT (adres sonradan değişirse sipariş etkilenmesin)
    public int AddressId { get; set; } // referans
    public string ShipCountry { get; set; } = default!;
    public string ShipCity { get; set; } = default!;
    public string ShipDistrict { get; set; } = default!;
    public string ShipNeighborhood { get; set; } = default!;
    public string ShipStreet { get; set; } = default!;
    public string ShipBuildingNo { get; set; } = default!;
    public string? ShipApartmentNo { get; set; }
    public string? ShipPostalCode { get; set; }
    public string? ShipLine2 { get; set; }
    public string? ShipContactPhone { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }         // referans amaçlı
    public string ProductName { get; set; } = default!;
    public string? ProductImagePath { get; set; }
    public decimal UnitPrice { get; set; }     // sipariş anındaki fiyat
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }     // UnitPrice * Quantity
}
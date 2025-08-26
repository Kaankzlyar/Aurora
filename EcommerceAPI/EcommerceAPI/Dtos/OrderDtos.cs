using EcommerceAPI.Models;

namespace EcommerceAPI.Dtos;

public record CheckoutRequest(int AddressId, int CardId, string? Note);
public record OrderItemDto(int ProductId, string ProductName, string? ProductImagePath, decimal UnitPrice, int Quantity, decimal LineTotal);
public record OrderDto(int Id, OrderStatus Status, decimal Subtotal, decimal ShippingFee, decimal GrandTotal, DateTime CreatedAt, IEnumerable<OrderItemDto> Items);

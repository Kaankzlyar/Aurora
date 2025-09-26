namespace EcommerceAPI.Dtos;

public record AddCartItemDto(int ProductId, int Quantity);
public record UpdateCartItemDto(int Quantity);

public record CartItemDto(
    int ProductId,
    string Name,
    decimal Price,
    string? ImagePath,
    int Quantity,
    decimal LineTotal
);

public record CartSummaryDto(
    IEnumerable<CartItemDto> Items,
    int TotalQuantity,
    decimal Subtotal
);

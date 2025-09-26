namespace EcommerceAPI.Dtos;

public record ProductDto(
    int Id,
    string Name,
    decimal Price,
    decimal? OriginalPrice,
    int? DiscountPercentage,
    int CategoryId,
    string CategoryName,
    int BrandId,
    string BrandName,
    string Gender,
    string? ImagePath,
    DateTime CreatedAt,
    bool IsOnDiscount,
    bool IsNewArrival
);

public record CreateProductDto(
    string Name,
    decimal Price,
    decimal? OriginalPrice,
    int? DiscountPercentage,
    int CategoryId,
    int BrandId,
    string Gender,
    string? ImagePath
);

public record UpdateProductDto(
    string Name,
    decimal Price,
    decimal? OriginalPrice,
    int? DiscountPercentage,
    int CategoryId,
    int BrandId,
    string Gender,
    string? ImagePath
);

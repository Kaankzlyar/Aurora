namespace EcommerceAPI.Dtos;

public record ProductDto(
    int Id,
    string Name,
    decimal Price,
    int CategoryId,
    string CategoryName,
    int BrandId,
    string BrandName,
    string? ImagePath
);

public record CreateProductDto(
    string Name,
    decimal Price,
    int CategoryId,
    int BrandId,
    string? ImagePath
);

public record UpdateProductDto(
    string Name,
    decimal Price,
    int CategoryId,
    int BrandId,
    string? ImagePath
);

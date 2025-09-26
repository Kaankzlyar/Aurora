namespace EcommerceAPI.Dtos;

public record BrandDto(int Id, string Name, string? Slug);
public record CreateBrandDto(string Name, string? Slug);
public record UpdateBrandDto(string Name, string? Slug);

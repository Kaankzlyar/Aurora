namespace EcommerceAPI.Dtos;

public record AddressDto(
    int Id, string Title, string Country, string City, string District,
    string Neighborhood, string Street, string BuildingNo, string? ApartmentNo,
    string? PostalCode, string? Line2, string? ContactPhone
);

public record CreateAddressDto(
    string Title, string Country, string City, string District,
    string Neighborhood, string Street, string BuildingNo, string? ApartmentNo,
    string? PostalCode, string? Line2, string? ContactPhone
);

public record UpdateAddressDto(
    string Title, string Country, string City, string District,
    string Neighborhood, string Street, string BuildingNo, string? ApartmentNo,
    string? PostalCode, string? Line2, string? ContactPhone
);

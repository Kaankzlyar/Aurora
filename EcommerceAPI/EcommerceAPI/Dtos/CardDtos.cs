namespace EcommerceAPI.Dtos;

// İstek: PAN/CVV sadece doğrulama için gelir, saklanmaz!
public record CreateCardDto(
    string HolderName,
    string Pan,          // "4111111111111111" gibi
    int ExpMonth,
    int ExpYear,
    string Cvv
);

public record CardDto(
    int Id,
    string HolderName,
    string Brand,
    string Last4,
    int ExpMonth,
    int ExpYear
);

public record UpdateCardDto(
    string HolderName,
    int ExpMonth,
    int ExpYear
);

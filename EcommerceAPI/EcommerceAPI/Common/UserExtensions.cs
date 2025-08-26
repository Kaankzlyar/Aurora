// EcommerceAPI/Common/UserExtensions.cs
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace EcommerceAPI; // <-- ÖNEMLİ: kök namespace'inizle aynı olsun

public static class UserExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        // JWT'de farklı claim adları olabilir; en yaygınlarını dene
        string? raw =
            user.FindFirstValue(ClaimTypes.NameIdentifier) ??
            user.FindFirst("nameid")?.Value ??
            user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
            user.FindFirst("sub")?.Value ??
            user.FindFirst("uid")?.Value ??
            user.FindFirst("userId")?.Value;

        if (string.IsNullOrWhiteSpace(raw))
            throw new UnauthorizedAccessException("User id claim not found.");

        if (int.TryParse(raw, out var id)) return id;

        // Eğer UserId'niz int değilse burayı kendi tipinize göre uyarlayın.
        throw new UnauthorizedAccessException("User id claim invalid.");
    }
}

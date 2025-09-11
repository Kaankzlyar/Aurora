namespace EcommerceAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public bool IsAdmin { get; set; } = false;
        public bool IsSuperAdmin { get; set; } = false; // Sadece Kaan Kızılyar
        public bool AdminRequested { get; set; } = false; // Admin olmak istiyor mu?
        public bool AdminRequestPending { get; set; } = false; // Onay bekliyor mu?
        public DateTime? AdminRequestDate { get; set; } // İstek tarihi
        public string? AdminRequestReason { get; set; } = string.Empty; // Admin olma sebebi
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<UserFavorite> UserFavorites { get; set; } = new List<UserFavorite>();
    }
}
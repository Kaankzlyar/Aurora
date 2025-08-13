namespace EcommerceAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
<<<<<<< HEAD
        public string LastName { get; set; } = string.Empty;
=======
>>>>>>> 6e5bc13e524bf6c95a46101914a8d33bf539a831
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
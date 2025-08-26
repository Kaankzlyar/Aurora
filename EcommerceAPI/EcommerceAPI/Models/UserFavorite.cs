using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceAPI.Models
{
    public class UserFavorite
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = default!;

        [ForeignKey("ProductId")]
        public Product Product { get; set; } = default!;
    }
}

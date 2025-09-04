using System.ComponentModel.DataAnnotations;

namespace EcommerceAPI.Dtos
{
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "E-posta adresi gerekli.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
        public string Email { get; set; } = string.Empty;
    }
}

<<<<<<< HEAD
﻿
using System.Text.Json.Serialization;

namespace EcommerceAPI.Dtos
{
    public class LoginDto
    {
        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("password")]
        public string Password { get; set; }
=======
﻿namespace EcommerceAPI.Dtos
{
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
>>>>>>> 6e5bc13e524bf6c95a46101914a8d33bf539a831
    }
}
namespace EcommerceAPI.Dtos
{
    public class AdminRequestDto
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class AdminRequestResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AdminRequestReason { get; set; } = string.Empty;
        public DateTime? AdminRequestDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ApproveAdminRequestDto
    {
        public int UserId { get; set; }
        public bool Approve { get; set; } // true = onay, false = red
        public string? Note { get; set; } = string.Empty; // Onay/red notu
    }
}

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace EcommerceAPI.Dtos;

public class UploadFileForm
{
    [Required]
    public IFormFile File { get; set; } = default!;

    [Required]
    public int BrandId { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public string? FileName { get; set; }
}

public record UploadResponse(string FileName, string Path, string Url);

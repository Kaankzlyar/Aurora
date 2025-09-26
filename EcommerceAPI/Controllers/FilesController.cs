using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    // C# 12 collection expression sorun çıkarmasın diye klasik dizi başlatıcı kullandık
    private static readonly string[] AllowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

    private readonly AppDbContext _db;
    public FilesController(AppDbContext db) => _db = db;

    /// <summary>Marka/Kategoriye göre dosya yükler</summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> Upload([FromForm] UploadFileForm form)
    {
        if (form.File is null || form.File.Length == 0)
            return BadRequest("Dosya boş.");

        var ext = Path.GetExtension(form.File.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest("Sadece jpg/jpeg/png/webp yükleyin.");

        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == form.BrandId);
        var cat = await _db.Categories.FirstOrDefaultAsync(c => c.Id == form.CategoryId);
        if (brand is null) return BadRequest("Geçersiz brandId.");
        if (cat is null) return BadRequest("Geçersiz categoryId.");

        var brandSlug = !string.IsNullOrWhiteSpace(brand.Slug) ? brand.Slug! : Slugify(brand.Name);
        var catSlug = !string.IsNullOrWhiteSpace(cat.Slug) ? cat.Slug! : Slugify(cat.Name);

        var baseName = !string.IsNullOrWhiteSpace(form.FileName)
            ? Slugify(form.FileName)
            : Slugify(Path.GetFileNameWithoutExtension(form.File.FileName));

        var finalName = $"{baseName}-{Guid.NewGuid():N}{ext}";

        var diskDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", brandSlug, catSlug);
        Directory.CreateDirectory(diskDir);

        var fullPath = Path.Combine(diskDir, finalName);
        using (var stream = System.IO.File.Create(fullPath))
            await form.File.CopyToAsync(stream);

        var webPath = $"/images/{brandSlug}/{catSlug}/{finalName}";
        var absoluteUrl = $"{Request.Scheme}://{Request.Host}{webPath}";

        return Ok(new UploadResponse(finalName, webPath, absoluteUrl));
    }

    // Basit slugify
    private static string Slugify(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return "item";

        var lower = input.Trim().ToLowerInvariant();
        var normalized = lower.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var ch in normalized)
        {
            var uc = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (uc != UnicodeCategory.NonSpacingMark) sb.Append(ch);
        }
        var noDiacritics = sb.ToString()
            .Replace('ı', 'i').Replace('ş', 's').Replace('ç', 'c')
            .Replace('ö', 'o').Replace('ü', 'u').Replace('ğ', 'g');

        var slug = Regex.Replace(noDiacritics, @"[^a-z0-9]+", "-").Trim('-');
        return string.IsNullOrEmpty(slug) ? "item" : slug;
    }
}

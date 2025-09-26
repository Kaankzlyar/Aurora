using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using EcommerceAPI.Data;
using EcommerceAPI.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    // C# 12 collection expression sorun çıkarmasın diye klasik dizi başlatıcı kullandık
    private static readonly string[] AllowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    public FilesController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    /// <summary>Marka/Kategoriye göre dosya yükler</summary>
     [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload([FromForm] UploadFileForm form)
    {
        if (form.File is null || form.File.Length == 0) return BadRequest("Dosya boş.");
        var ext = Path.GetExtension(form.File.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext)) return BadRequest("Sadece jpg/jpeg/png/webp yükleyin.");

        var brand = await _db.Brands.FindAsync(form.BrandId);
        var cat   = await _db.Categories.FindAsync(form.CategoryId);
        if (brand is null) return BadRequest("Geçersiz brandId.");
        if (cat   is null) return BadRequest("Geçersiz categoryId.");

        var brandSlug = string.IsNullOrWhiteSpace(brand.Slug) ? Slugify(brand.Name) : brand.Slug!;
        var catSlug   = string.IsNullOrWhiteSpace(cat.Slug)   ? Slugify(cat.Name)   : cat.Slug!;

        var baseName  = string.IsNullOrWhiteSpace(form.FileName)
            ? Slugify(Path.GetFileNameWithoutExtension(form.File.FileName))
            : Slugify(form.FileName);

        var safeName  = $"{baseName}-{Guid.NewGuid():N}{ext}";
        var webRoot   = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
        Directory.CreateDirectory(webRoot);

        var diskDir   = Path.Combine(webRoot, "images", brandSlug, catSlug);
        Directory.CreateDirectory(diskDir);

        await using var fs = System.IO.File.Create(Path.Combine(diskDir, safeName));
        await form.File.CopyToAsync(fs);

        var webPath = $"/images/{brandSlug}/{catSlug}/{safeName}";
        var url     = $"{Request.Scheme}://{Request.Host}{webPath}";
        return Ok(new UploadResponse(safeName, webPath, url));
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

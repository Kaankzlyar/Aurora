using Microsoft.EntityFrameworkCore;
using EcommerceAPI.Data;
using EcommerceAPI.Models;

namespace EcommerceAPI
{
    public class UpdateImagePaths
    {
        public static async Task Main(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=EcommerceDB;Trusted_Connection=true;MultipleActiveResultSets=true");
            
            using var context = new AppDbContext(optionsBuilder.Options);
            
            Console.WriteLine("ImagePath güncelleme başlıyor...");
            
            // Mevcut ürünleri al
            var products = await context.Products.ToListAsync();
            Console.WriteLine($"Toplam {products.Count} ürün bulundu.");
            
            foreach (var product in products)
            {
                var oldPath = product.ImagePath;
                var newPath = GetNewImagePath(product.ImagePath);
                
                if (newPath != oldPath)
                {
                    product.ImagePath = newPath;
                    Console.WriteLine($"Güncellendi: {product.Name} - {oldPath} -> {newPath}");
                }
            }
            
            await context.SaveChangesAsync();
            Console.WriteLine("Güncelleme tamamlandı!");
        }
        
        private static string GetNewImagePath(string? oldPath)
        {
            if (string.IsNullOrEmpty(oldPath))
                return "/images/default/no-image.jpg";
                
            var lowerPath = oldPath.ToLower();
            
            // Marka bazlı güncellemeler
            if (lowerPath.Contains("balenciaga"))
                return "/images/balenciaga/balenciagaShoe1.jpg";
            else if (lowerPath.Contains("gucci"))
                return "/images/gucci/GucciAyakkabı1.jpg";
            else if (lowerPath.Contains("prada"))
                return "/images/prada/PradaEyewear1.jpg";
            else if (lowerPath.Contains("swarovski"))
                return "/images/swarovski/swarovskiJewelry1.jpg";
            else if (lowerPath.Contains("tom") || lowerPath.Contains("ford"))
                return "/images/tom-ford/TomFordSuit1.jpg";
            else if (lowerPath.Contains("versace"))
                return "/images/versace/versacePerfume1.jpg";
            else if (lowerPath.Contains("saint") || lowerPath.Contains("laurent"))
                return "/images/saint-laurent/SaintLaurentBag1.jpg";
            else if (lowerPath.Contains("ysl"))
                return "/images/saint-laurent/SaintLaurentBag1.jpg";
            
            // Eğer zaten tam yol ise, olduğu gibi bırak
            if (oldPath.StartsWith("/images/"))
                return oldPath;
                
            // Varsayılan
            return "/images/default/no-image.jpg";
        }
    }
}

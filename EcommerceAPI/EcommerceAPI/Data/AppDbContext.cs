using EcommerceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users => Set<User>();

        public DbSet<Brand> Brands => Set<Brand>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<CartItem> CartItems => Set<CartItem>();

    public DbSet<UserFavorite> UserFavorites => Set<UserFavorite>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            b.Entity<Category>()
                .Property(c => c.Name).HasMaxLength(60).IsRequired();

            b.Entity<Category>()
                .Property(c => c.Slug).HasMaxLength(60);   // <-- opsiyonel ama iyi olur
            b.Entity<Category>()
                .HasIndex(c => c.Slug).IsUnique(false);

            b.Entity<Brand>()
                .Property(br => br.Name).HasMaxLength(60).IsRequired();

            // Marka adı benzersiz olsun (elite marka listesi için iyi)
            b.Entity<Brand>()
                .HasIndex(br => br.Name).IsUnique();

            b.Entity<Product>()
                .Property(p => p.Name).HasMaxLength(120).IsRequired();

            b.Entity<Product>()
                .HasIndex(p => p.CategoryId);

            // 
            b.Entity<Product>().HasIndex(p => p.BrandId);


            b.Entity<CartItem>()
                .HasIndex(ci => new { ci.UserId, ci.ProductId })
                .IsUnique();

            b.Entity<CartItem>()
                .Property(ci => ci.Quantity)
                .HasDefaultValue(1);

            // UserFavorite ilişkileri
            b.Entity<UserFavorite>()
                .HasIndex(uf => new { uf.UserId, uf.ProductId })
                .IsUnique();

            b.Entity<UserFavorite>()
                .HasOne(uf => uf.User)
                .WithMany(u => u.UserFavorites)
                .HasForeignKey(uf => uf.UserId);

            b.Entity<UserFavorite>()
                .HasOne(uf => uf.Product)
                .WithMany()
                .HasForeignKey(uf => uf.ProductId);
        }
    }
}


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
        public DbSet<Address> Addresses => Set<Address>();
public DbSet<CardOnFile> Cards => Set<CardOnFile>();
public DbSet<Order> Orders => Set<Order>();
public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    public DbSet<UserFavorite> UserFavorites => Set<UserFavorite>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            b.Entity<Address>().HasIndex(a => a.UserId);
    b.Entity<CardOnFile>().HasIndex(c => c.UserId);
    b.Entity<CardOnFile>().Property(c => c.Last4).HasMaxLength(4).IsRequired();
    b.Entity<CardOnFile>().Property(c => c.Brand).HasMaxLength(20).IsRequired();

     b.Entity<Order>()
        .HasMany(o => o.Items)
        .WithOne()
        .HasForeignKey(i => i.OrderId)
        .OnDelete(DeleteBehavior.Cascade);

    b.Entity<OrderItem>().Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
    b.Entity<OrderItem>().Property(i => i.LineTotal).HasColumnType("decimal(18,2)");
    b.Entity<Order>().Property(o => o.Subtotal).HasColumnType("decimal(18,2)");
    b.Entity<Order>().Property(o => o.ShippingFee).HasColumnType("decimal(18,2)");
    b.Entity<Order>().Property(o => o.GrandTotal).HasColumnType("decimal(18,2)");


    b.Entity<Product>().Property(p => p.Gender).HasConversion<byte>().HasDefaultValue(Product.GenderType.Unisex);

    b.Entity<Product>().HasIndex(p => p.Gender);

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


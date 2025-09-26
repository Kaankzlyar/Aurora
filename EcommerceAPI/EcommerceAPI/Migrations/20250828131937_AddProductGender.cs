using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddProductGender : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "Gender",
                table: "Products",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)3);

            migrationBuilder.CreateIndex(
                name: "IX_Products_Gender",
                table: "Products",
                column: "Gender");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_Gender",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Products");
        }
    }
}

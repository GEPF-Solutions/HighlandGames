using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HighlandGames.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDisciplineImageData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "caber");

            migrationBuilder.DeleteData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "fire");

            migrationBuilder.DeleteData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "rope");

            migrationBuilder.DeleteData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "sync");

            migrationBuilder.DeleteData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "weight");

            migrationBuilder.RenameColumn(
                name: "Icon",
                table: "Disciplines",
                newName: "ImageContentType");

            migrationBuilder.AddColumn<byte[]>(
                name: "ImageData",
                table: "Disciplines",
                type: "bytea",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageData",
                table: "Disciplines");

            migrationBuilder.RenameColumn(
                name: "ImageContentType",
                table: "Disciplines",
                newName: "Icon");

            migrationBuilder.InsertData(
                table: "Disciplines",
                columns: new[] { "Id", "Description", "Icon", "Name", "Number", "Status" },
                values: new object[,]
                {
                    { "caber", null, "💪", "Seilziehen", 3, "upcoming" },
                    { "fire", null, "🔥", "Wetttrinken", 5, "upcoming" },
                    { "rope", null, "🪵", "Baumstammwerfen", 4, "upcoming" },
                    { "sync", null, "🏃", "Brettlauf", 1, "upcoming" },
                    { "weight", null, "🏋️", "Kübellauf", 2, "upcoming" }
                });
        }
    }
}

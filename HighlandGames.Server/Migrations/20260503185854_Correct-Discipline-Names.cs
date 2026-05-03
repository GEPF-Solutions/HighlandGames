using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HighlandGames.Server.Migrations
{
    /// <inheritdoc />
    public partial class CorrectDisciplineNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "caber",
                columns: new[] { "Icon", "Name" },
                values: new object[] { "💪", "Seilziehen" });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "fire",
                column: "Name",
                value: "Wetttrinken");

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "rope",
                columns: new[] { "Icon", "Name" },
                values: new object[] { "🪵", "Baumstammwerfen" });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "sync",
                column: "Name",
                value: "Brettlauf");

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "weight",
                column: "Name",
                value: "Kübellauf");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "caber",
                columns: new[] { "Icon", "Name" },
                values: new object[] { "🪵", "Baumstammwerfen" });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "fire",
                column: "Name",
                value: "Durstlöschen");

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "rope",
                columns: new[] { "Icon", "Name" },
                values: new object[] { "💪", "Seilziehen" });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "sync",
                column: "Name",
                value: "Synchronlauf");

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: "weight",
                column: "Name",
                value: "Gewichtlauf");
        }
    }
}

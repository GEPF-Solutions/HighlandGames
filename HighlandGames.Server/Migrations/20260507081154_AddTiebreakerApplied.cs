using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HighlandGames.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTiebreakerApplied : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "TiebreakerApplied",
                table: "Teams",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TiebreakerApplied",
                table: "Teams");
        }
    }
}

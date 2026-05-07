using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HighlandGames.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTiebreakerRank : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TiebreakerRank",
                table: "Teams",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TiebreakerRank",
                table: "Teams");
        }
    }
}

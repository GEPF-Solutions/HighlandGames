using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HighlandGames.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddNewMatchLogic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Teams_TeamBId",
                table: "Matches");

            migrationBuilder.AlterColumn<Guid>(
                name: "TeamBId",
                table: "Matches",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Matches",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Matches",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Teams_TeamBId",
                table: "Matches",
                column: "TeamBId",
                principalTable: "Teams",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Teams_TeamBId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "Matches");

            migrationBuilder.AlterColumn<Guid>(
                name: "TeamBId",
                table: "Matches",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Teams_TeamBId",
                table: "Matches",
                column: "TeamBId",
                principalTable: "Teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

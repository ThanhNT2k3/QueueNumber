using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankNext.QMS.Infrastructure.Migrations
{
    public partial class AddPrefixToCategory : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Prefix",
                table: "Categories",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Prefix",
                table: "Categories");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankNext.QMS.Infrastructure.Migrations
{
    public partial class AddCounterIdToTicket : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Column CounterId already exists in the database but migration history is out of sync.
            // Emptying this method allows 'database update' to succeed and mark this migration as applied.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Branches");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "CounterAssignmentHistories");

            migrationBuilder.DropTable(
                name: "Counters");

            migrationBuilder.DropTable(
                name: "Tickets");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}

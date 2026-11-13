using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PihitWise.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderRepeat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RepeatEveryKm",
                table: "Reminders",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RepeatEveryKm",
                table: "Reminders");
        }
    }
}

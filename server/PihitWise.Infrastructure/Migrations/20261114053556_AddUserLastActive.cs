using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PihitWise.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLastActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastActiveAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastActiveAt",
                table: "Users");
        }
    }
}

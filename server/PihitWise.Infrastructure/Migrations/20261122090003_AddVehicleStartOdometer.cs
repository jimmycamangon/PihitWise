using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PihitWise.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleStartOdometer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StartOdometer",
                table: "Vehicles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Existing bikes keep their current odometer as the Garage reading, so nothing changes for riders.
            migrationBuilder.Sql("UPDATE \"Vehicles\" SET \"StartOdometer\" = \"Odometer\";");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StartOdometer",
                table: "Vehicles");
        }
    }
}


namespace PihitWise.Application.FuelLogs
{
    public record FuelEconomyResponse(
        decimal? AverageKmPerLiter,          // null = not enough full tanks yet
        List<FuelEconomyPoint> Points);

    public record FuelEconomyPoint(Guid FuelLogId, DateOnly Date, decimal KmPerLiter);
}

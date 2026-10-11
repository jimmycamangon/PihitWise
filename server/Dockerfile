# Builds and runs the API in a container (used by Render).
# Build from the server folder: docker build -t pihitwise-api .

# 1. Build stage: has the .NET SDK, compiles the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish PihitWise.API/PihitWise.API.csproj -c Release -o /app

# 2. Run stage: only the small runtime, plus the compiled app
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

# Render gives the port in $PORT; use 8080 when running locally
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "ASPNETCORE_HTTP_PORTS=${PORT:-8080} exec dotnet PihitWise.API.dll"]

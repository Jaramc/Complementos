FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Directory.Build.props", "./"]
COPY ["src/PQRS.Domain/PQRS.Domain.csproj", "src/PQRS.Domain/"]
COPY ["src/PQRS.Application/PQRS.Application.csproj", "src/PQRS.Application/"]
COPY ["src/PQRS.Infrastructure/PQRS.Infrastructure.csproj", "src/PQRS.Infrastructure/"]
COPY ["src/PQRS.Api/PQRS.Api.csproj", "src/PQRS.Api/"]
RUN dotnet restore "src/PQRS.Api/PQRS.Api.csproj"

COPY . .
WORKDIR "/src/src/PQRS.Api"
RUN dotnet build "PQRS.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PQRS.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PQRS.Api.dll"]

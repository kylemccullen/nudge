FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Nudge.API/Nudge.API.csproj", "Nudge.API/"]
COPY ["Nudge.Client/Nudge.Client.csproj", "Nudge.Client/"]
COPY ["Nudge.Shared/Nudge.Shared.csproj", "Nudge.Shared/"]
RUN dotnet restore "Nudge.API/Nudge.API.csproj"
COPY . .
WORKDIR "/src/Nudge.API"
RUN dotnet build "Nudge.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Nudge.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Nudge.API.dll"]

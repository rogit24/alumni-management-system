FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["NotificationMS.csproj", "./"]
RUN dotnet restore "NotificationMS.csproj"
COPY . .
RUN dotnet publish "NotificationMS.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8087
EXPOSE 8087
ENTRYPOINT ["dotnet", "NotificationMS.dll"]

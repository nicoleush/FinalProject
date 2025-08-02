# משתמש בתמונה של .NET 8
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

# מוסיף את קובץ ה-proj ומבצע restore
COPY WebTemplate.csproj .
RUN dotnet restore

# מוסיף את שאר הקבצים ובונה את הפרויקט
COPY . .
RUN dotnet publish WebTemplate.csproj -c Release -o out


# שלב הריצה
FROM mcr.microsoft.com/dotnet/runtime:8.0

WORKDIR /app
COPY --from=build /app/out .

EXPOSE 10000
ENV ASPNETCORE_URLS=http://+:10000
ENTRYPOINT ["dotnet", "WebTemplate.dll"]

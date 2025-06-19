# שלב 1: בנייה עם .NET 8
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# מעתיקים את קובץ הפרויקט ומבצעים restore
COPY WebTemplate.csproj ./
RUN dotnet restore WebTemplate.csproj

# מעתיקים את כל הקבצים ובונים את האפליקציה
COPY . ./
RUN dotnet publish WebTemplate.csproj -c Release -o out

# שלב 2: הרצה עם .NET 8 Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# מעתיקים את האפליקציה הבנויה
COPY --from=build /app/out .

# Render משתמש ב־ENV PORT – לא לשנות
ENV PORT=10000
EXPOSE 10000

# מריצים את האפליקציה שלך
ENTRYPOINT ["dotnet", "WebTemplate.dll"]

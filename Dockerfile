# שלב בנייה
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# מעתיקים את קובץ הפרויקט
COPY *.csproj ./
RUN dotnet restore

# מעתיקים את כל הקוד ומבצעים build
COPY . ./
RUN dotnet publish -c Release -o out

# שלב הרצה
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# הפורט ש-Render צריך להאזין לו
ENV PORT=10000
EXPOSE 10000

# מריצים את האפליקציה
ENTRYPOINT ["dotnet", "WebTemplate.dll"]

# שלב בנייה
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app

# מעתיקים את הקבצים
COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

# שלב ריצה
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app/out .

# הפורט ש-Render ישתמש בו
ENV PORT=10000
EXPOSE 10000

# הרצה
ENTRYPOINT ["dotnet", "WebTemplate.dll"]

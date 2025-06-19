FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

WORKDIR /app/out
EXPOSE 10000
ENTRYPOINT ["dotnet", "FinalProject.dll"]

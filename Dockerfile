FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /app

COPY WebTemplate.csproj ./
RUN dotnet restore WebTemplate.csproj

COPY . ./
RUN dotnet publish WebTemplate.csproj -c Release -o out

WORKDIR /app/out
EXPOSE 10000
ENTRYPOINT ["dotnet", "FinalProject.dll"]

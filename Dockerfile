FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM node:20-slim AS node-build
WORKDIR /src
COPY highlandgames.client/package*.json highlandgames.client/
RUN cd highlandgames.client && npm ci

FROM mcr.microsoft.com/dotnet/sdk:10.0.102 AS build
COPY --from=node-build /usr/local/bin/node /usr/local/bin/node
COPY --from=node-build /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/bin/node /usr/local/bin/nodejs \
 && ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["HighlandGames.Server/HighlandGames.Server.csproj", "HighlandGames.Server/"]
COPY ["highlandgames.client/highlandgames.client.esproj", "highlandgames.client/"]
RUN dotnet restore "./HighlandGames.Server/HighlandGames.Server.csproj"
COPY . .
COPY --from=node-build /src/highlandgames.client/node_modules highlandgames.client/node_modules
WORKDIR "/src/HighlandGames.Server"
RUN dotnet build "./HighlandGames.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./HighlandGames.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HighlandGames.Server.dll"]

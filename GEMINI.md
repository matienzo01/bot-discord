# Gemini Code Assistant Report

## Project Overview

This project is a Discord bot application developed with TypeScript and Node.js. It uses the Express framework for handling HTTP requests and the `discord.js` library for interacting with the Discord API. The application is containerized using Docker and orchestrated with Docker Compose. It also includes a CI/CD pipeline for automated builds and deployments.

The idea of the app is to develop a platform that allow users to sync a discord server with a game server of their choice, mainly minecraft. This means that any change in the discord server with cause the game server to perform some actions and viceversa.

For now the app only handles the discord part of things but will introduce the minecraft part as well

## Key Technologies

- **Backend:** Node.js, Express
- **Language:** TypeScript
- **Discord Interaction:** `discord.js`
- **Dependency Injection:** InversifyJS
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## Project Structure

The project is organized into several directories:

- `src`: Contains the source code of the application.
  - `bot`: Handles Discord bot-related logic.
  - `config`: Manages application configuration and dependency injection.
  - `controllers`: Defines the HTTP request handlers.
  - `middlewares`: Includes custom middleware for handling errors.
  - `services`: Contains the business logic of the application.
- `bruno`: Contains Bruno collections for API testing.
- `.github/workflows`: Defines the CI/CD pipeline.

## How to Run the Project

### Development

To run the project in a development environment, you can use the following command:

```bash
pnpm dev
```

This command uses `ts-node-dev` to automatically restart the server when changes are detected.

### Production

To run the project in a production environment, you can use the following commands:

```bash
pnpm build
pnpm start
```

These commands first compile the TypeScript code to JavaScript and then start the server.

## Containerization

The project includes Dockerfiles for both development and production environments. The `docker-compose.yml` file defines the services required to run the application, including the backend, a PostgreSQL database, and a LuckPerms REST API.

## CI/CD

The project has a CI/CD pipeline configured in `.github/workflows/docker-image-build.yml`. This pipeline automatically builds and pushes a Docker image to the GitHub Container Registry (GHCR) on every push to the `master` branch. It also deploys the application to a remote server.

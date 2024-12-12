#!/bin/bash

set -e

# Colors for readability
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Wait if encountered an error
trap "echo -e '${RED}Script encountered an error.${NC} Press Enter to close...'; read" ERR

BASE_DIR=$(dirname "$0")
cd "$BASE_DIR"

# Check Docker
echo -e "${GREEN}Checking Docker installation...${NC}"
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: Docker is not installed.${NC}"
  exit 1
fi

# Check VPN client
echo -e "${GREEN}Checking SoftEther VPN Client...${NC}"
if ! [ -x "$(command -v vpncmd)" ]; then
  echo -e "${RED}Warning: SoftEther VPN Client is not installed.${NC}"
fi

# Clone or pull the main repository
echo -e "${GREEN}Pulling the project repository...${NC}"
REPO_URL="<YOUR_PUBLIC_REPO_URL>" # Replace this with your public repo URL
PROJECT_DIR="xr-it-client"

if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${GREEN}Cloning the repository...${NC}"
  git clone "$REPO_URL" "$PROJECT_DIR"
else
  echo -e "${GREEN}Repository already exists. Pulling the latest changes...${NC}"
  cd "$PROJECT_DIR"
  git reset --hard HEAD  # Reset any local changes to avoid conflicts
  git pull origin main   # Replace 'main' with your default branch if different
  cd "$BASE_DIR"
fi

cd "$PROJECT_DIR"

# Start the mock-express-app
MOCK_EXPRESS_APP_DIR="mock-client-middleman"
C_SHARP_PORT=8080

if [ -d "$MOCK_EXPRESS_APP_DIR" ]; then
  echo -e "${GREEN}Starting the mock-express-app...${NC}"
  cd "$MOCK_EXPRESS_APP_DIR"
  npm install  # Install dependencies
  npm start &  # Start the application in the background
  # START WITH PRIVILLEGED RIGHTS
  # git config --global core.autocrlf input ENTRYPOINT FIX
  # npm i fails
  MOCK_APP_PID=$!
  cd "$BASE_DIR/$PROJECT_DIR"
else
  echo -e "${RED}mock-express-app directory not found. Exiting.${NC}"
  exit 1
fi

# Launch Docker Compose
echo -e "${GREEN}Launching Docker containers...${NC}"
DOCKER_COMPOSE_FILE="docker-compose-client.yml"
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
  if ! docker-compose -f "$DOCKER_COMPOSE_FILE" up --build -d; then
    echo -e "${RED}Error: Docker Compose failed to start.${NC}"
    kill $MOCK_APP_PID
    exit 1
  fi
else
  echo -e "${RED}Docker Compose file not found: $DOCKER_COMPOSE_FILE.${NC}"
  kill $MOCK_APP_PID
  exit 1
fi


# Verify setup
echo -e "${GREEN}Verifying setup...${NC}"
if ! curl -s http://localhost:$C_SHARP_PORT/ > /dev/null; then
  echo -e "${RED}mock-express-app failed to start.${NC}"
  kill $MOCK_APP_PID
  exit 1
fi

# All services started successfully
echo -e "${GREEN}All services started successfully!${NC}"

read -p "Script completed. Press Enter to exit..."

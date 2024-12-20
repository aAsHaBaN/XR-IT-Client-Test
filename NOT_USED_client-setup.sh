#!/bin/bash

set -e

# Colors for readability
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script as root or with sudo.${NC}"
  exit 1
fi

# Wait if encountered an error
trap "echo -e '${RED}Script encountered an error.${NC}'; kill $NODE_MIDDLEMAN_APP_PID 2>/dev/null; read -p 'Press Enter to close...'; exit 1" ERR

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
REPO_URL="https://github.com/aAsHaBaN/XR-IT-Client-Test.git"
PROJECT_DIR="xr-it-client"

if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${GREEN}Cloning the repository...${NC}"
  git clone "$REPO_URL" "$PROJECT_DIR"
else
  echo -e "${GREEN}Repository already exists. Pulling the latest changes...${NC}"
  cd "$PROJECT_DIR"
  git reset --hard HEAD
  git pull origin main
  cd "$BASE_DIR"
fi

cd "$PROJECT_DIR"

# Fix line ending issues in the repository
echo -e "${GREEN}Fixing line ending issues...${NC}"
git config --global core.autocrlf input
git rm --cached -r .
git reset --hard HEAD

# Start the node-middleman app
NODE_MIDDLEMAN_APP_DIR="node-middleman"
NODE_MIDDLEMAN_PORT=2224

pkill -f "node-middleman" 2>/dev/null || true  # Stop any existing instance

if [ -d "$NODE_MIDDLEMAN_APP_DIR" ]; then
  echo -e "${GREEN}Starting the node-middleman...${NC}"
  cd "$NODE_MIDDLEMAN_APP_DIR"

  echo -e "${GREEN}Fixing npm issues...${NC}"
  npm install npm -g
  npm install > npm-install.log 2>&1

  echo -e "${GREEN}Building and starting the application...${NC}"
  npm start &  # Start the application in the background
  NODE_MIDDLEMAN_APP_PID=$!

  cd "$BASE_DIR/$PROJECT_DIR"
else
  echo -e "${RED}node-middleman directory not found. Exiting.${NC}"
  exit 1
fi

# Launch Docker Compose
echo -e "${GREEN}Launching Docker containers...${NC}"
DOCKER_COMPOSE_FILE="docker-compose-client.yml"
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
  docker-compose -f "$DOCKER_COMPOSE_FILE" up --build -d > docker-compose.log 2>&1
else
  echo -e "${RED}Docker Compose file not found: $DOCKER_COMPOSE_FILE.${NC}"
  kill $NODE_MIDDLEMAN_APP_PID
  read -p "Press Enter to close..."
  exit 1
fi

# Verify setup
echo -e "${GREEN}Verifying setup...${NC}"
if ! curl -m 10 -s http://localhost:$NODE_MIDDLEMAN_PORT/ > /dev/null; then
  echo -e "${RED}node-middleman failed to start within timeout.${NC}"
  kill $NODE_MIDDLEMAN_APP_PID
  read -p "Press Enter to close..."
  exit 1
fi

# All services started successfully
echo -e "${GREEN}All services started successfully!${NC}"

read -p "Script completed. Press Enter to exit..."

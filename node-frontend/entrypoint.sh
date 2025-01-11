#!/bin/sh

# Dynamically determine the host IP address
HOST_IP=$(ip route | awk '/default/ { print $3 }')

# Set the NODE_BACKEND_URL environment variable
export NODE_BACKEND_URL="http://$HOST_IP:2223"

echo "Backend URL set to: $NODE_BACKEND_URL"

# Execute the CMD from the Dockerfile
exec "$@"

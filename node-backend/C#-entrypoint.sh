#!/bin/bash

set -e

# Start the C# app if not already running
C_SHARP_PORT=8080
if ! curl -s http://localhost:$C_SHARP_PORT/ > /dev/null; then
  echo "Starting the C# app..."
  cd /app/mock-.NET-middleman
  npm run build
  npm start &
  echo $! > /tmp/csharp_pid
  cd -
else
  echo "C# app is already running."
fi

# Start the XR-IT client application (Node.js backend)
echo "Starting the XR-IT client application..."
exec "$@"

# Stop the C# app when the container is stopped
trap 'echo "Stopping the C# app..."; kill $(cat /tmp/csharp_pid) || true' EXIT

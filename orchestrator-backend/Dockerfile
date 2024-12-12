# Use Node.js official image as the base image
FROM node:18

# Create and set the working directory
WORKDIR /orchestrator-backend

# Copy the package.json
COPY package.json ./

# Install VPN client
    #RUN apt-get update && apt-get install -y softether-vpnclient

# Install dependencies
RUN npm install

# Copy the rest of the application's code
COPY . .

# Expose the port
EXPOSE 2222

# Move the sample-config files to config folder
#RUN mv config/sample-configs/development/* config/

# Run VPN client and start the orchestrator on container startup
    #CMD ["sh", "-c", "softether-vpnclient start && npm start"]

# Start the Node.js server
CMD ["npm", "start"]
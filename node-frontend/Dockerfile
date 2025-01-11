# Base image
FROM node:18-alpine

# Set the working directory
WORKDIR /node-frontend

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /entrypoint.sh

# Pass the environment variable during the build step
ARG NODE_BACKEND_URL
ENV NODE_BACKEND_URL=${NODE_BACKEND_URL}

# Build the application
RUN npm run build

# Expose the port the Next.js app will run on
EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

# Start the Next.js application
CMD ["npm", "start"]

# Use Node.js official image as the base image
FROM node:18

# Create and set the working directory
WORKDIR /node-backend

# Copy the package.json
COPY package.json ./

# esbuild maintains a cache that might need clearing to fix version mismatches
RUN npm cache clean --force

RUN npm install esbuild@latest --save-dev

# Install dependencies
RUN npm install

# Copy the rest of the application's code
COPY . .

# Expose the backend port
EXPOSE 2223

# Start the Node.js server
#CMD ["npm", "run", "dev", "use_default=local", "config_id=6925669e-043e-4654-af79-d36c8518ee43"]
#CMD ["npm", "run", "start:mocks:all"]
#CMD ["npm", "run", "dev"]
CMD ["npm", "run", "dev", "use_default=distributed"]
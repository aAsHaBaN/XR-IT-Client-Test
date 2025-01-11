# Use Node.js official image as the base image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Pass build arguments to set environment variables during the build process
ARG NEXT_PUBLIC_SOCKET_HOST
ARG NEXT_PUBLIC_UNREAL_DEFAULT_PORT
ARG NEXT_PUBLIC_ORCHESTRATOR_BACKEND

ENV NEXT_PUBLIC_SOCKET_HOST=$NEXT_PUBLIC_SOCKET_HOST
ENV NEXT_PUBLIC_UNREAL_DEFAULT_PORT=$NEXT_PUBLIC_UNREAL_DEFAULT_PORT
ENV NEXT_PUBLIC_ORCHESTRATOR_BACKEND=$NEXT_PUBLIC_ORCHESTRATOR_BACKEND

RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/next.config.mjs ./next.config.mjs

ENV NODE_ENV=production
ENV NEXT_PUBLIC_SOCKET_HOST=$NEXT_PUBLIC_SOCKET_HOST
ENV NEXT_PUBLIC_ORCHESTRATOR_BACKEND=$NEXT_PUBLIC_ORCHESTRATOR_BACKEND

# Expose the port the Next.js app will run on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]

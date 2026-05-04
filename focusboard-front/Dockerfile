# Stage 1: Build the React application
FROM node:20-alpine AS build_stage

# Set working directory inside the container
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Use install instead of ci to allow architecture-specific binary resolution (e.g., for esbuild)
# Removed --silent to ensure build logs are visible if needed
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Vite project for production
RUN npm run build

# Stage 2: Serve the application with Nginx (Optimized for ARM64)
FROM nginx:alpine AS production_stage

# Copy built static assets from the previous stage
COPY --from=build_stage /app/dist /usr/share/nginx/html

# Expose port 80 for internal Docker network routing
EXPOSE 80

# Start Nginx server in the foreground
CMD ["nginx", "-g", "daemon off;"]

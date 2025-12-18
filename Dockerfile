# Use a specific Node.js version for stability
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for `nest build`)
RUN npm ci --include=dev

# Copy app source code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# The command to run your app. Railway will inject the PORT.
CMD ["npm", "run", "start:prod"]
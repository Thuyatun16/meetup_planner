# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# Expose port and start app
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

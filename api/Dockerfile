# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY api.js ./

# Expose port 9080
EXPOSE 9080

# Set environment variable
ENV PORT=9080

# Start the application
CMD ["node", "api.js"]

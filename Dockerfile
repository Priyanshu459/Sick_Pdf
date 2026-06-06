FROM node:20-bullseye-slim

# Install required system dependencies for PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ghostscript \
    qpdf \
    libreoffice \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

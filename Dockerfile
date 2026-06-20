FROM node:20-bullseye-slim

# Install required system dependencies for PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ghostscript \
    qpdf \
    libreoffice \
    fonts-liberation \
    python3 \
    python3-pip \
    zip \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies for PDF to Word, PDF to Excel, and PDF to PPTX
RUN pip3 install pdf2docx "PyMuPDF<1.24.0" pdfplumber pandas openpyxl python-pptx

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN npm ci

# Copy all project files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

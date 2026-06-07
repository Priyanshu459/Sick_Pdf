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
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies for PDF to Word and PDF to Excel
RUN pip3 install pdf2docx "PyMuPDF<1.24.0" pdfplumber pandas openpyxl

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

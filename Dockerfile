FROM node:20-slim

# Install sharp dependencies
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY .env.example .env

# Create templates directory
RUN mkdir -p templates

EXPOSE 4000

CMD ["node", "src/index.js"]

FROM node:20-alpine

WORKDIR /app

# Copy package files first — Docker caches this layer
# so npm ci only re-runs when dependencies change
COPY package*.json ./

RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]

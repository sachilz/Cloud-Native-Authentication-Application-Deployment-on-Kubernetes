FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]

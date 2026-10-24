
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY --chown=node:node . .

# Run as non-root
USER node

EXPOSE 5000

CMD ["node", "src/server.js"]

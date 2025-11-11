# Step 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# Step 2: Production image
FROM node:20-alpine

WORKDIR /app

# Only copy necessary artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV production

EXPOSE 3000
CMD ["npm", "run", "start"]


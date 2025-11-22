# Step 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .


ARG FIREBASE_SERVICE_ACCOUNT
ENV FIREBASE_SERVICE_ACCOUNT=$FIREBASE_SERVICE_ACCOUNT

RUN npm install
RUN echo "FIREBASE_SERVICE_ACCOUNT length: " ${#FIREBASE_SERVICE_ACCOUNT}
RUN npm run build

# Step 2: Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "run", "start"]

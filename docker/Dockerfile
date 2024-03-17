FROM node:19-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . ./
RUN npm run build

FROM node:19-alpine AS production
WORKDIR /app
RUN apk add --no-cache git
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "dist/server.js"]

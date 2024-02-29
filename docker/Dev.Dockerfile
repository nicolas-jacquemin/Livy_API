FROM node:19-alpine
RUN apk add --no-cache bash
WORKDIR /app
EXPOSE 3000
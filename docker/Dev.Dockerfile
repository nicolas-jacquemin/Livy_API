FROM node:19-alpine
RUN apk add --no-cache bash
RUN apk add --no-cache git
WORKDIR /app
EXPOSE 3000
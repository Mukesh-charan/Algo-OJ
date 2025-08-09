FROM node:24-alpine
WORKDIR /app/compiler
RUN apk update && apk add --no-cache python3 g++ gcc openjdk17-jdk
COPY . .
RUN npm install
EXPOSE 5245
CMD ["node", "index.js"]

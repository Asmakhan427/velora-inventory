FROM node:20-alpine

WORKDIR /app

# better-sqlite3 may need to compile from source on musl (alpine) if no
# prebuilt binary is published for this platform.
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /app/data

EXPOSE 4000

CMD ["npm", "run", "start"]

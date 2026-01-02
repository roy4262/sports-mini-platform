FROM node:18-alpine

WORKDIR /app

# install deps
COPY package*.json ./
RUN npm install --production

# copy source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]

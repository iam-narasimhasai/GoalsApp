FROM node:23-alpine3.20

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY . .

EXPOSE 3000 

CMD ["node","app.js"]

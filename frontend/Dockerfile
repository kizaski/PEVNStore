# Use the official Node.js as a base image
FROM node:18

WORKDIR /app/frontend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]


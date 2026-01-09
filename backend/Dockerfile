FROM node:18

WORKDIR /app/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

RUN npm install && npm run db:create $$ npm run seed:run

CMD ["npm", "run", "dev"]

FROM node:alpine

WORKDIR /app

ENV DB tickets-mongo-srv

COPY package.json .
RUN npm install --only=prod
COPY . .

CMD ["npm","start"]
FROM node:alpine

WORKDIR /app

ENV DB auth-mongo-srv

COPY package.json .
RUN npm install --only=prod
COPY . .

CMD ["npm","start"]
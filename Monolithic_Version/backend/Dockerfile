FROM node:21-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npx tsc

EXPOSE 4000

CMD ["npm", "run", "dev"]

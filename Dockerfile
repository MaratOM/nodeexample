FROM node:10-stretch

WORKDIR /app

RUN npm install -g nodemon

# Установить зависимости приложения
# Используется символ подстановки для копирования как package.json, так и package-lock.json,
# работает с npm@5+
COPY package*.json ./

RUN npm install --only=production

EXPOSE 8080

CMD ["nodemon", "--ignore", "./server/static", "./server/index.js"]

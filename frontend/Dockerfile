FROM node:20-alpine AS dev

WORKDIR /app

# Cache node_modules layer
COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .

EXPOSE 3000

ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"]

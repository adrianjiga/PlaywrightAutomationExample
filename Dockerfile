FROM mcr.microsoft.com/playwright:v1.65.0-noble

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]

FROM mcr.microsoft.com/playwright:v1.65.1-noble

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]

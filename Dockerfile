FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

COPY package*.json ./

RUN npm ci

RUN npx playwright install --with-deps

RUN mkdir -p reports/html reports/json

COPY . .

CMD ["npx", "playwright", "test"]

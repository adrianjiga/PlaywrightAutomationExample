FROM mcr.microsoft.com/playwright:v1.60.0-noble

WORKDIR /app

COPY package*.json ./

RUN npm ci

RUN npx playwright install --with-deps

RUN mkdir -p reports/html reports/json

COPY . .

CMD ["npx", "playwright", "test"]

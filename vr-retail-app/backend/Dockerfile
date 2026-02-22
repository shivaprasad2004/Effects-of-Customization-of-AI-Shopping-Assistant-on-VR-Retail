FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install
COPY . .
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "start"]

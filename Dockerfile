FROM node:24-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
RUN npx esbuild server.ts --bundle --platform=node --format=esm --target=node24 --outfile=server.js --external:express --external:firebase-admin --external:nodemailer --external:google-auth-library --external:vite

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json
EXPOSE 3000
CMD ["node", "server.js"]

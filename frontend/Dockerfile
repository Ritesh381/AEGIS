# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Hardcode production env vars so Vite can bake them into the static bundle
ENV VITE_API_BASE_URL=https://aegis-backend-189371266037.asia-south1.run.app
ENV VITE_FIREBASE_API_KEY=AIzaSyDRSaqy1xCWDv4YEKG4qDYvNckaG8J_isM
ENV VITE_FIREBASE_AUTH_DOMAIN=aegis-f7d03.firebaseapp.com
ENV VITE_FIREBASE_PROJECT_ID=aegis-f7d03
ENV VITE_FIREBASE_STORAGE_BUCKET=aegis-f7d03.firebasestorage.app
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=120441152999
ENV VITE_FIREBASE_APP_ID=1:120441152999:web:9b2999ae65c944e2e30942

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

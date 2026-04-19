FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
# Si vous utilisez bun, installez d'abord bun dans l'image ou utilisez simplement npm
RUN npm install

COPY . .

RUN npm run build

# Etape finale pour servir via nginx
FROM nginx:alpine

# Copie le build
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Par défaut nginx écoute sur 80.
# Attention : un fichier de conf `nginx.conf` est utile pour le routage SPA React
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

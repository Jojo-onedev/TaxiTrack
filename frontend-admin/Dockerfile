# Étape 1 : Build
FROM node:20-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Créer le build de production
RUN npm run build

# Étape 2 : Serveur de production
FROM nginx:stable-alpine

# Copier les fichiers de build vers le dossier Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration personnalisée pour React Router (optionnel mais recommandé)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]

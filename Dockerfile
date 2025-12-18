FROM node:20-bullseye 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
RUN rm -rf dist   # Only clean dist, NOT node_modules
COPY . . 
RUN npm run build   # Use npm run build instead of npx nest
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 
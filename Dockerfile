FROM node:20-bullseye 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
COPY . . 
RUN chmod +x node_modules/.bin/nest 
RUN npm run build 
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 

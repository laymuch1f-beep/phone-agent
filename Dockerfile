FROM node:20-alpine 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
COPY . . 
RUN npx nest build 
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 

FROM node:20-slim 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --include=dev 
COPY . . 
RUN npx tsc -p tsconfig.json 
EXPOSE 3000 
CMD ["npm", "run", "start:prod"] 

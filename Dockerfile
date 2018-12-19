# build environment
FROM node
WORKDIR /usr/src/app
RUN mkdir conf
COPY package*.json ./
RUN npm install
COPY . .

# production environment

USER node
CMD ["node", "index.js"]

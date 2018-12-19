# build environment
FROM node
WORKDIR /usr/app
RUN mkdir conf
COPY package*.json ./
RUN npm install --loglevel verbose
COPY . .

# production environment

USER node
CMD ["node", "index.js"]

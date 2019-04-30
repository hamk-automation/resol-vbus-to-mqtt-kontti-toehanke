# build environment
FROM arm32v7/node:10-stretch
WORKDIR /usr/app
RUN mkdir conf
COPY package*.json ./
RUN npm install --save --production
COPY . .

# production environment

USER node
CMD ["node", "index.js"]

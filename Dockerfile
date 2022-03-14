FROM node:8.5
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install

COPY . /usr/src/app/
ENV SPARQL_ENDPOINT http://172.17.0.2:3030/ontology/sparql
EXPOSE 10444
ENTRYPOINT  [ "npm", "run", "demo" ]



FROM node:18

# Create app directory
WORKDIR /enam-adapter

COPY package*.json /enam-adapter/

RUN npm install --unsafe-perm

COPY . /enam-adapter/

EXPOSE 10003

CMD npm start
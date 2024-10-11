FROM node:18

# Create app directory
WORKDIR /ondc-buyer-adapter

COPY package*.json /ondc-buyer-adapter/

RUN npm install --unsafe-perm

COPY . /ondc-buyer-adapter/

EXPOSE 10003

CMD npm start
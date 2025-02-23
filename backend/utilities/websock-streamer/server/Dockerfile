FROM node:18

# Create app directory
WORKDIR /streamer-serverlib

COPY package*.json /streamer-serverlib/

RUN npm install --unsafe-perm

COPY . /streamer-serverlib/

EXPOSE 8081

CMD npm start
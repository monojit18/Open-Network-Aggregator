FROM node:18

# Create app directory
WORKDIR /video-adapter

COPY package*.json /video-adapter/

RUN npm install --unsafe-perm

COPY . /video-adapter/

EXPOSE 10003

CMD npm start
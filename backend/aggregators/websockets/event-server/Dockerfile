FROM node:18

# Create app directory
WORKDIR /event-serverlib

COPY package*.json /event-serverlib/

RUN npm install --unsafe-perm

COPY . /event-serverlib/

EXPOSE 8081

CMD npm start
FROM node:18

# Create app directory
WORKDIR /event-receiver-client

COPY package*.json /event-receiver-client/

RUN npm install --unsafe-perm

COPY . /event-receiver-client/

EXPOSE 8084

CMD npm start
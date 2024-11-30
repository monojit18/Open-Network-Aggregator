FROM node:18

# Create app directory
WORKDIR /event-receiverlib

COPY package*.json /event-receiverlib/

RUN npm install --unsafe-perm

COPY . /event-receiverlib/

EXPOSE 8084

CMD npm start
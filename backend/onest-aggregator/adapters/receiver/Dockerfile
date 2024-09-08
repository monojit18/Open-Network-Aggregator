FROM node:18

# Create app directory
WORKDIR /seeker-receiverlib

COPY package*.json /seeker-receiverlib/

RUN npm install --unsafe-perm

COPY . /seeker-receiverlib/

EXPOSE 8081

CMD npm start
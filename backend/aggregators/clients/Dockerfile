FROM node:18

# Create app directory
WORKDIR /seeker-client

COPY package*.json /seeker-client/

RUN npm install --unsafe-perm

COPY . /seeker-client/

EXPOSE 10010

CMD npm start
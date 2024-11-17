FROM node:18

# Create app directory
WORKDIR /provider-client

COPY package*.json /provider-client/

RUN npm install --unsafe-perm

COPY . /provider-client/

EXPOSE 10011

CMD npm start
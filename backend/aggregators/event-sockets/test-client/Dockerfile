FROM node:18

# Create app directory
WORKDIR /test-client

COPY package*.json /test-client/

RUN npm install --unsafe-perm

COPY . /test-client/

EXPOSE 10010

CMD npm start
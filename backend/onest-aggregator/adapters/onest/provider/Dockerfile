FROM node:18

# Create app directory
WORKDIR /provider-adapter

COPY package*.json /provider-adapter/

RUN npm install --unsafe-perm

COPY . /provider-adapter/

EXPOSE 10002

CMD npm start
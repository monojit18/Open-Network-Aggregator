FROM node:18

# Create app directory
WORKDIR /master-agent

COPY package*.json /master-agent/

RUN npm install --unsafe-perm

COPY . /master-agent/

EXPOSE 10003

CMD npm start
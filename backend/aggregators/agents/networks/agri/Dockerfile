FROM node:18

# Create app directory
WORKDIR /agri-agent

COPY package*.json /agri-agent/

RUN npm install --unsafe-perm

COPY . /agri-agent/

EXPOSE 10002

CMD npm start
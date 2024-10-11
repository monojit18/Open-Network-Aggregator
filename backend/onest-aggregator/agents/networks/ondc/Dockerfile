FROM node:18

# Create app directory
WORKDIR /ondc-agent

COPY package*.json /ondc-agent/

RUN npm install --unsafe-perm

COPY . /ondc-agent/

EXPOSE 10004

CMD npm start
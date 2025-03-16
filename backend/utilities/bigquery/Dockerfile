FROM node:18

# Create app directory
WORKDIR /bigquerylib

COPY package*.json /bigquerylib/

RUN npm install --unsafe-perm

COPY . /bigquerylib/

EXPOSE 6076

CMD npm start
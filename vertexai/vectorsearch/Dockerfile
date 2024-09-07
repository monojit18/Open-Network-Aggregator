FROM node:18

# Create app directory
WORKDIR /vector-searchlib

COPY package*.json /vector-searchlib/

RUN npm install --unsafe-perm

COPY . /vector-searchlib/

EXPOSE 6064

CMD npm start
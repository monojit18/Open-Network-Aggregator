FROM node:18

# Create app directory
WORKDIR /translatelib

COPY package*.json /translatelib/

RUN npm install --unsafe-perm

COPY . /translatelib/

EXPOSE 6061

CMD npm start
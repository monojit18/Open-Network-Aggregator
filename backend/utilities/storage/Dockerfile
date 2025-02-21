FROM node:18

# Create app directory
WORKDIR /storagelib
RUN mkdir /storagelib/data

COPY package*.json /storagelib/

RUN npm install --unsafe-perm

COPY . /storagelib/

EXPOSE 6060

CMD npm start
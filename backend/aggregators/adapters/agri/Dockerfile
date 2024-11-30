FROM node:18

# Create app directory
WORKDIR /agri-adapter

COPY package*.json /agri-adapter/

RUN npm install --unsafe-perm

COPY . /agri-adapter/

EXPOSE 10001

CMD npm start
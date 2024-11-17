FROM node:18

# Create app directory
WORKDIR /enam-mandi-adapter

COPY package*.json /enam-mandi-adapter/

RUN npm install --unsafe-perm

COPY . /enam-mandi-adapter/

EXPOSE 10003

CMD npm start
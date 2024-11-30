FROM node:18

# Create app directory
WORKDIR /mandi-adapter

COPY package*.json /mandi-adapter/

RUN npm install --unsafe-perm

COPY . /mandi-adapter/

EXPOSE 10001

CMD npm start
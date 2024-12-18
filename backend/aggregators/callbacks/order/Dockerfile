FROM node:18

# Create app directory
WORKDIR /order-callback

COPY package*.json /order-callback/

RUN npm install --unsafe-perm

COPY . /order-callback/

EXPOSE 10011

CMD npm start
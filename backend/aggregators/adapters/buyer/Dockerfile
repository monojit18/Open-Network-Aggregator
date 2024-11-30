FROM node:18

# Create app directory
WORKDIR /buyer-adapter

COPY package*.json /buyer-adapter/

RUN npm install --unsafe-perm

COPY . /buyer-adapter/

EXPOSE 10001

CMD npm start
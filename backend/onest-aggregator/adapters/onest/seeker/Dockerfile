FROM node:18

# Create app directory
WORKDIR /seeker-adapter

COPY package*.json /seeker-adapter/

RUN npm install --unsafe-perm

COPY . /seeker-adapter/

EXPOSE 10001

CMD npm start
FROM node:18

# Create app directory
WORKDIR /weather-adapter

COPY package*.json /weather-adapter/

RUN npm install --unsafe-perm

COPY . /weather-adapter/

EXPOSE 10001

CMD npm start
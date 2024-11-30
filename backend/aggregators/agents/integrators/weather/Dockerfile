FROM node:18

# Create app directory
WORKDIR /weather-agent

COPY package*.json /weather-agent/

RUN npm install --unsafe-perm

COPY . /weather-agent/

EXPOSE 10002

CMD npm start
FROM node:18

# Create app directory
WORKDIR /video-agent

COPY package*.json /video-agent/

RUN npm install --unsafe-perm

COPY . /video-agent/

EXPOSE 10004

CMD npm start
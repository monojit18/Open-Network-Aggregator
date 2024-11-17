FROM node:18

# Create app directory
WORKDIR /onest-agent

COPY package*.json /onest-agent/

RUN npm install --unsafe-perm

COPY . /onest-agent/

EXPOSE 10004

CMD npm start
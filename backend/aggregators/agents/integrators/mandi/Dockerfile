FROM node:18

# Create app directory
WORKDIR /mandi-agent

COPY package*.json /mandi-agent/

RUN npm install --unsafe-perm

COPY . /mandi-agent/

EXPOSE 10002

CMD npm start
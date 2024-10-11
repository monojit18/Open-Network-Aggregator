FROM node:18

# Create app directory
WORKDIR /enam-mandi-agent

COPY package*.json /enam-mandi-agent/

RUN npm install --unsafe-perm

COPY . /enam-mandi-agent/

EXPOSE 10004

CMD npm start
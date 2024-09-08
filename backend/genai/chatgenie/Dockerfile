FROM node:18

# Create app directory
WORKDIR /chatgenie

COPY package*.json /chatgenie/

RUN npm install --unsafe-perm

COPY . /chatgenie/

EXPOSE 6069

CMD npm start
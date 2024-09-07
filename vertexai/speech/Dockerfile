FROM node:18

# Create app directory
WORKDIR /speechlib
RUN mkdir /speechlib/data

COPY package*.json /speechlib/

RUN npm install --unsafe-perm

COPY . /speechlib/

EXPOSE 6063

CMD npm start
FROM node:18

# Create app directory
WORKDIR /gemini-multimodallib

COPY package*.json /gemini-multimodallib/

RUN npm install --unsafe-perm

COPY . /gemini-multimodallib/

EXPOSE 6067

CMD npm start
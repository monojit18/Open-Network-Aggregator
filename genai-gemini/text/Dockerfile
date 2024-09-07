FROM node:18

# Create app directory
WORKDIR /gemini-textlib

COPY package*.json /gemini-textlib/

RUN npm install --unsafe-perm

COPY . /gemini-textlib/

EXPOSE 6065

CMD npm start
FROM node:18

# Create app directory
WORKDIR /genai-imagelib

COPY package*.json /genai-imagelib/

RUN npm install --unsafe-perm

COPY . /genai-imagelib/

EXPOSE 6066

CMD npm start
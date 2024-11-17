FROM node:18

# Create app directory
WORKDIR /llm-adapter

COPY package*.json /llm-adapter/

RUN npm install --unsafe-perm

COPY . /llm-adapter/

EXPOSE 10003

CMD npm start
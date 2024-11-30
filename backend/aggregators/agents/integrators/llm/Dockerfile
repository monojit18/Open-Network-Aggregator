FROM node:18

# Create app directory
WORKDIR /llm-agent

COPY package*.json /llm-agent/

RUN npm install --unsafe-perm

COPY . /llm-agent/

EXPOSE 10002

CMD npm start
FROM node:18

# Create app directory
WORKDIR /planner-agent

COPY package*.json /planner-agent/

RUN npm install --unsafe-perm

COPY . /planner-agent/

EXPOSE 10002

CMD npm start
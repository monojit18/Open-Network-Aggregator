FROM node:18

# Create app directory
WORKDIR /planner-adapter

COPY package*.json /planner-adapter/

RUN npm install --unsafe-perm

COPY . /planner-adapter/

EXPOSE 10001

CMD npm start
FROM node:18

# Create app directory
WORKDIR /onest-seeker-adapter

COPY package*.json /onest-seeker-adapter/

RUN npm install --unsafe-perm

COPY . /onest-seeker-adapter/

EXPOSE 10001

CMD npm start
FROM node:18

# Create app directory
WORKDIR /visionlib
RUN mkdir /visionlib/data

COPY package*.json /visionlib/

RUN npm install --unsafe-perm

COPY . /visionlib/

EXPOSE 6062

CMD npm start
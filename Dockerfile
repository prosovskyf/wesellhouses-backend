FROM node:14

# Create app directory
WORKDIR /usr/src/app
# copy package.json and lock file
COPY package.json ./
# install dependecies needed (for sharp package) and run npm install
RUN apt-get update && apt-get install -y build-essential && apt-get install -y python && apt-get install -y postgresql-client && npm install
# copy all other files
COPY . .
# install http-server (file hosting)
RUN npm install http-server
# env variables
ENV host=host.docker.internal
ENV user=DB_USER
ENV port=DB_PORT
ENV password=DB_PASS
ENV database=DATABASE
ENV secret=RANDOM_SECRET
ENV SENDGRID_API_KEY=SENDGRID_API
ENV zoopla_key=ZOOPLA_KEY
# expose ports (3005 API, 8080 Fileserver, 3030 Documentation)
EXPOSE 3005
EXPOSE 8080
EXPOSE 3030
# run fileserver, api and docs at the same time
CMD npx concurrently "http-server ./ -c-1 -s" "npm start" "npm run docs"
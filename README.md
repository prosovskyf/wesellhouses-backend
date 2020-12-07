# 304CEM-backend
Project coursework for 304CEM - backend - We Sell Houses
<br>
API (npm start): /api/v1/ 
<br>
PORT: 3005
<br>
Tests: npm test
<br>
To set up database, follow 'Docker - Database set up'

# To view frontend repository
[We Sell Houses frontend](https://github.coventry.ac.uk/304CEM-2021SEPJAN/304CEM-frontend)

# Documentation (npm run docs):
<br>
    Code: port 3030 path: /
    <br>
    Api: port 3030 path: /api

# Docker
Both frontend and backend are configured to run in docker
<br>
<b>TO RUN:</b> Edit docker file with all values needed
<br>
Use: docker build -t YOUR_NAME/wesellhouses-backend .
<br>
Database set up: Have postgresql set up on your machine and replicate the schema using db_data file in this repo:
PGPASSWORD=USER_PASS PGUSER=ROLE_USER psql -h HOSTNAME wesellhouses < db_data
<br>
Run: docker run  -p 8080:8080 -p 3005:3005 -p 3030:3030 YOUR_NAME/wesellhouses-backend:latest
<br>
This will run API on 3005, docs on 3030 and static file server on 8080 as temporary solution for file storage. (npm test works as well in docker because postgresql client is installed, DB can be controlled using regular psql commands - specify the values in package.json file for tests)
    
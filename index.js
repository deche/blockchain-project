const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const {mine} = require('./mine/mine');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' })); 

require('./routes/apiRoutes')(app);

mine();

const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('Sever listening on:', port);
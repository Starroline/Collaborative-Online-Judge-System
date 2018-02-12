const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const io = socketIO();
const editorSocketService = require('./services/editorSocketService')(io);

//connect mongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://user:user@ds125126.mlab.com:25126/project1');

const restRouter = require('./routes/rest');
const indexRouter = require('./routes/index');

app.use(express.static(path.join(__dirname, '../public/'))); // get the static files
app.use('/', indexRouter); // handle localhost:3000
app.use('/api/v1', restRouter); // handle localhost:3000/api/v1 etc

// users won't type in 'api/v1' after 3000, wo need to handle this at the frontend with angular
app.use((req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../public/') });
});

const server = http.createServer(app);
io.attach(server);
server.listen(3000);
server.on('listening', onListening);

function onListening() {
    console.log('App listening on port 3000!')
}
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

const publicDirecrory = path.join(__dirname, '../public');

app.use(express.static(publicDirecrory));

io.on('connection', socket => {
  console.log('New user connected');

  socket.on('join', ({ username, room }, cb) => {
    const { error, user } = addUser({
      id: socket.id,
      username,
      room
    });

    if (error) {
      return cb(error);
    }

    socket.join(user.room);
    socket.emit(
      'welcomeMessage',
      generateMessage(user.username, 'Welcome to my friend')
    );
    socket.broadcast
      .to(user.room)
      .emit(
        'welcomeMessage',
        generateMessage('Admin', `${user.username} has joined!`)
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    cb();
  });

  socket.on('clientMessage', (message, cb) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    if (filter.isProfane(message)) {
      return cb('Please be polite dont use bad words');
    }

    io.to(user.room).emit(
      'welcomeMessage',
      generateMessage(user.username, message)
    );
    cb();
  });
  socket.on('sentLocation', (location, cb) => {
    const user = getUser(socket.id);
    io.emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://maps.google.com/?q=${location.lat},${location.long}`
      )
    );
    cb();
  });
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'welcomeMessage',
        generateMessage(user.username, `${user.username} has disconnected! `)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log('Server is up on port : 3000');
});
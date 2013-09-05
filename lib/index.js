const socketIo   = require('socket.io');
const passportIo = require('passport.socketio');
const socketInfo = require('./socket-info');
const logLevel   = process.env.NODE_ENV ? 1 : 3;

module.exports = function(server, options) {
  const io = socketIo.listen(server);

  io.set('log level', logLevel);
  io.set('authorization', passportIo.authorize(options));

  io.configure('production', function() {
    io.enable('browser client minification'); // send minified client
    io.enable('browser client etag');         // apply etag caching logic based on version number
    io.enable('browser client gzip');         // gzip the file
  });

  io.sockets.on('connection', function(socket) {
    var treeId = null;

    // join new tree (room)
    socket.on('tree', function(newTreeId) {
      if (newTreeId === treeId) return;
      leave();

      treeId = newTreeId;
      socket.join(newTreeId);
      viewers();
    });

    // sync whatever you need
    socket.on('sync', function (data) {
      socket.broadcast.to(treeId).emit('sync', data);
    });

    // emit `viewers` on disconnect
    socket.on('disconnect', leave);

    function leave() {
      if (!treeId) return;
      socket.leave(treeId);
      viewers();
    }

    function viewers() {
      const sockets = io.sockets.clients(treeId);
      const data    = sockets.map(socketInfo);
      if (data.length) io.sockets.in(treeId).emit('viewers', data);
    }
  });
};

var socketIo = require('socket.io');
var passportIo = require('passport.socketio');

/**
 * Expose `socketServer()`.
 */

module.exports = socketServer;

/**
 * Create new socket.io instance to `server`
 * with authentication support though `passportIo`.
 *
 * @param {Server} server
 * @param {Number} logLevel - 0..3
 * @param {Object} ops
 */

function socketServer(server, logLevel, ops) {
  var io = socketIo.listen(server);

  io.set('log level', logLevel);
  if (ops) io.set('authorization', passportIo.authorize(ops));

  io.configure('production', function() {
    io.enable('browser client minification'); // send minified client
    io.enable('browser client etag'); // apply etag caching logic based on version number
    io.enable('browser client gzip'); // gzip response
  });

  io.sockets.on('connection', function(socket) {
    var trees = null;

    // join new tree, which contain trees as ['id1', 'id2', 'id3']
    // first argumnent is always main tree.
    socket.on('subscribe', function(newTrees) {
      leave();
      trees = newTrees;
      trees.forEach(function(id) { socket.join(id) });
      viewers();
    });

    // sync whatever you need
    socket.on('sync', function(data) {
      if (!trees) return;
      socket.broadcast.to(data.treeId).emit('sync', data);
    });

    // emit `viewers` on disconnect
    socket.on('disconnect', leave);

    function leave() {
      if (!trees) return;
      trees.forEach(function(id) { socket.leave(id) });
      viewers();
    }

    function viewers() {
      trees.forEach(function(treeId) {
        var sockets = io.sockets.clients(treeId);
        var data = sockets.map(socketInfo);
        if (data.length) io.sockets.in(treeId).emit('viewers', data);
      });
    }
  });
}

/**
 * Get info about `socket`.
 *
 * @param {Socket} socket
 * @return {Object} json - { email, id, agent, socketId }
 */

function socketInfo(socket) {
  var user = socket.handshake.user;
  var json = user ? user.toJSON() : {};

  json.agent = socket.handshake.headers['user-agent'] || '';
  json.socketId = socket.id;

  return json;
}

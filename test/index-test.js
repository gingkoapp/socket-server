process.env.NODE_ENV = 'test';

const socketServer = require('../lib');
const expect       = require('chai').expect;
const _            = require('underscore');
const io           = require('socket.io-client');
const server       = require('http').createServer();

socketServer(server);
server.listen(7357);

describe('Socket Server', function() {
  var alex, mark, ivan;

  beforeEach(function(done) {
    var next = _.after(3, function() {
      alex.emit('tree', 1);
      mark.emit('tree', 1);
      ivan.emit('tree', 2);
      timeout(done);
    });

    alex = connect(next);
    mark = connect(next);
    ivan = connect(next);
  });

  it('emits `viewers` on disconnect', function(done) {
    mark.disconnect();

    alex.on('viewers', function(viewers) {
      expect(viewers).length(1);
      expect(_.keys(viewers[0])).eql(['agent', 'socketId']);
      timeout(done);
    });

    ivan.on('viewers', function() {
      done('error: it emits only in related room');
    });
  });

  afterEach(function() {
    alex.disconnect();
    mark.disconnect();
    ivan.disconnect();
  });
});

/**
 * Helpers
 */

function timeout(cb) {
  _.delay(cb, 30);
}

function connect(cb) {
  const socket = io.connect('http://localhost:7357/', { 'force new connection': true });
  socket.on('connect', cb);
  return socket;
}

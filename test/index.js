var socketServer = require('..');
var expect = require('chai').expect;
var _ = require('underscore');
var io = require('socket.io-client');
var server = require('http').createServer();

socketServer(server, 1);
server.listen(7357);

describe('Socket Server', function() {
  var alex, mark, ivan;

  beforeEach(function(done) {
    var next = _.after(3, function() {
      alex.emit('subscribe', [1]);
      mark.emit('subscribe', [1]);
      ivan.emit('subscribe', [2]);
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

    mark.on('viewers', function() {
      done('error: it does not get events after disconnect');
    });

    ivan.on('viewers', function() {
      done('error: it emits only in related tree');
    });
  });

  it('emits `viewers` event after join', function(done) {
    ivan.emit('subscribe', [1]);
    var next = _.after(3, done);

    alex.on('viewers', function(data) { expect(data).length(3); next() });
    mark.on('viewers', function(data) { expect(data).length(3); next() });
    ivan.on('viewers', function(data) { expect(data).length(3); next() });
  });

  it('emits `sync` event', function(done) {
    var json = { _id: 1, name: 'test' };
    alex.emit('sync', { treeId: 1, collection: 'trees', event: 'add', json: json });

    mark.on('sync', function(data) {
      expect(data.collection).equal('trees');
      expect(data.event).equal('add');
      expect(data.json).eql(json);
      timeout(done);
    });

    alex.on('sync', function() {
      done('error: it does not return event back');
    });

    ivan.on('sync', function() {
      done('error: it broadcasts only in room with treeId');
    });
  });

  it('handles error cases', function(done) {
    var adri = connect(function() {
      adri.emit('sync', { collection: 'trees', event: 'add', json: {} });
      adri.disconnect();
      timeout(done);
    });

    adri.on('viewers', function() {
      done('error: he does not join the room');
    });

    adri.on('sync', function() {
      done('error: it does not broadcast to yourself in empty room');
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
  var socket = io.connect('http://localhost:7357/', { 'force new connection': true });
  socket.on('connect', cb);
  return socket;
}

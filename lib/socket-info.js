/**
 * Socket info helpers
 */

const parse = require('ua-parser').parse;

module.exports = function socketInfo(socket) {
  const user  = socket.handshake.user;
  const json  = user ? user.toJSON() : {};

  json.agent    = getAgent(socket);
  json.socketId = socket.id;

  return json;
};

function getAgent(socket) {
  const ua     = parse(socket.handshake.headers['user-agent'] || '');
  const device = ua.device.family === 'Other' ? ua.os.family : ua.device.family;

  return ua.family + ' for ' + device;
}

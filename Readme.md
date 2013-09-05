# Socket Server

  It's a simple and lightweight wrapper around [socket.io](http://socket.io)
  to support gingko's real-time collaboration.
  It handles only 2 events:

  * `tree`: connect to tree, and emit `viewers` `[{ _id, email, agent, socketId }, ...]` to all clients.
  * `sync`: something happen in selected tree, and broadcast `sync`.

## Example

```js
var socket = require('socket-server');

// first param is server instance,
// second is a passport.socketio options
socket.connect(server, {
  cookieParser: express.cookieParser
  secret:       sessionSecret
  store:        sessionStore
});
```

# Socket Server

  It's a simple and lightweight wrapper around [socket.io](http://socket.io)
  to support gingko's real-time collaboration.

  It handles only 2 events:

  * `subscribe`: join list of trees, and emit `viewers` `[{ _id, email, agent, socketId }, ...]` to all clients.
  * `sync`: something happen in selected tree, and broadcast `sync`.

## Example

```js
var socketServer = require('socket-server');

// first param is server instance,
// third is logLevel and third is a passport.socketio options
socketServer(server, 3, {
  cookieParser: express.cookieParser,
  secret: sessionSecret,
  store: sessionStore,
});
```

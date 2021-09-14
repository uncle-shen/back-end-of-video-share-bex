const WS_MODULE = require("ws");

const routes = new Map();

let ws = null;
let count = 0;

const createWebSocket = (server, callback) => {
  ws = new WS_MODULE.Server({ server });
  ws.on("connection", (conn) => {
    conn.key = count++;
    conn.on("message", (jsonStr) => {
      const req = JSON.parse(jsonStr);
      if (routes.has(req.path))
        routes.get(req.path)({
          key: conn.key,
          data: req.data,
          reply: (path, res) => {
            sendMessage(conn, { path, data: res });
          },
          broadcast: (data) => {
            broadcast(conn, req.path, data);
          },
        });
      else pathNotFound(req.path);
    });
    callback(conn);
  });
};

const on = (path, func) => {
  routes.set(path, func);
};

const remove = (path) => {
  routes.delete(path);
};

const pathNotFound = (path) => {
  console.log(path + ` 404`);
};

const sendMessage = (conn, data) => {
  conn.send(JSON.stringify(data));
};

const broadcast = (from, path, data) => {
  ws.clients.forEach((conn) => {
    if (conn != from && conn.readyState === WS_MODULE.OPEN) {
      sendMessage(conn, { path, data });
    }
  });
};

module.exports = {
  createWebSocket,
  on,
  remove,
  sendMessage,
  broadcast,
};

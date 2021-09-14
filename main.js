const express = require("express");

const http = require("http");
const ws = require("./SocketApp");

const UM = require("./ClientManager");
const PM = require("./PlayerManager");
const MessageType = require("./MessageType");

let messageID = 0;

//获取当前所有用户
ws.on(MessageType.GET_USER, ({ reply }) => {
  reply(MessageType.POST_USERS, { users: UM.getAllUsers() });
});

ws.on(MessageType.GET_USER_ID, ({ key, reply }) => {
  reply(MessageType.PUT_USER_ID, { id: key });
});

//上传用户信息
ws.on(MessageType.POST_USER, ({ key, data, broadcast, reply }) => {
  console.log(key, `修改用户名为`, data.nickname);
  UM.setUser(key, data);
  const user = UM.getUser(key);
  broadcast({ user: [user.id, user] });
  reply(MessageType.PUT_USER_ID, { id: user.id });
});

//获取当前状态
ws.on(MessageType.GET_PLAYER_STATUS, ({ reply }) => {
  reply(MessageType.PUT_PLAYER_STATUS, { status: PM.getStatus() });
});

//设置当前状态
ws.on(MessageType.PUT_PLAYER_STATUS, ({ key, data, broadcast }) => {
  let user;
  if ((user = UM.getUser(key)))
    console.log(user.nickname, `设置播放器当前状态为:`, data.status);
  else console.log(key, `设置播放器当前状态为:`, data.status);
  PM[data.status]();
  data.uid = key;
  broadcast(data);
});

//获取当前时间
ws.on(MessageType.GET_PLAYER_CURRENTTIME, ({ reply }) => {
  reply(MessageType.PUT_PLAYER_CURRENTTIME, {
    current_time: PM.getCurrentTime(),
  });
});

//设置当前时间
ws.on(MessageType.PUT_PLAYER_CURRENTTIME, ({ key, data, broadcast }) => {
  let user;
  if ((user = UM.getUser(key)))
    console.log(user.nickname, `设置播放器当前时间为:`, data.currentTime);
  else console.log(key, `设置播放器当前时间为:`, data.currentTime);
  PM.setCurrentTime(data.currentTime);
  data.uid = key;
  broadcast(data);
});

//设置视频链接
ws.on(MessageType.POST_PLAYER_URL, ({ key, data }) => {
  const user = UM.getUser(key);
  console.log(user.nickname, `设置视频链接:`, data.url);
  PM.setVideoUrl(data.url);
  PM.pause();
  PM.setCurrentTime(0);
});

//获取视频链接
ws.on(MessageType.GET_PLAYER_URL, ({ reply }) => {
  reply(MessageType.POST_PLAYER_URL, { url: PM.getVideoUrl() });
});

//发送消息
ws.on(MessageType.POST_MESSAGE, ({ key, data, broadcast, reply }) => {
  const user = UM.getUser(key);
  console.log(user.nickname, `发送消息:`, data.text[0]);
  const now = new Date();
  const message = {
    id: messageID++,
    uid: user.id,
    stamp: now,
    ...data,
  };
  broadcast(message);
  message.sent = true;
  reply(MessageType.POST_MESSAGE, message);
});

const app = express();
const port = 80;

/**
 * 解析post、put等请求体参数
 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/video/url", (req, res) => {
  res.send(JSON.stringify({ url: PM.getVideoUrl() }));
});

app.put("/video/url", (req, res) => {
  PM.setVideoUrl(req.body.url);
  PM.pause();
  PM.setCurrentTime(0);
  res.json({ url: PM.getVideoUrl() });
});

const server = http.createServer(app);
ws.createWebSocket(server, (conn) => {
  conn.on("close", function (code, reason) {
    const user = UM.getUser(conn.key);
    console.log(user ? user.nickname : conn.key, `关闭连接---`, code);
    UM.removeUser(conn.key);
    if (UM.getSize() == 0) PM.pause();
    if (user) ws.broadcast(conn, MessageType.DELETE_USER, { uid: user.id });
  });
  console.log(conn.key, `连接至服务器`);
});

server.listen(port, () => {
  console.log("服务器已开启，端口号：" + port);
});

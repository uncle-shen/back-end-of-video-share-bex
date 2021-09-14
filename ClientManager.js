const users = new Map();

let ucount = 0;

const setUser = (key, user) => {
  const datetime = new Date();

  if (!user.hasOwnProperty("id")) {
    const hour = ("0" + datetime.getHours()).slice(-2),
      minute = ("0" + datetime.getMinutes()).slice(-2),
      second = ("0" + datetime.getSeconds()).slice(-2),
      count = ("000" + ++ucount).slice(-4);
    user.id = hour + minute + second + count;
  }
  console.log(user.id);
  users.set(key, user);
  console.log("在线人数", users.size);
};

const getSize = () => {
  return users.size;
};

const getUser = (key) => {
  return users.get(key);
};

const getAllUsers = () => {
  const res = [];
  for (let user of users.values()) {
    res.push([user.id, user]);
  }
  return res;
};

const removeUser = (key) => {
  users.delete(key);
};

module.exports = {
  setUser,
  getUser,
  removeUser,
  getAllUsers,
  getSize,
};

const PAUSE = "pause",
  PLAY = "play";

let status = PAUSE,
  current_time = 0,
  interval = null,
  videoUrl = "";

const play = () => {
  console.log("视频已播放");
  status = PLAY;
  interval = setInterval(() => {
    current_time += 1;
    console.log(current_time);
  }, 1000);
};

const pause = () => {
  console.log("视频已暂停，当前进度", current_time);
  status = PAUSE;
  clearInterval(interval);
};

const setCurrentTime = (ct) => {
  console.log("进度被设置为：" + ct);
  current_time = ct;
};

const getCurrentTime = () => {
  return current_time;
};

const getVideoUrl = () => {
  return videoUrl;
};

const setVideoUrl = (url) => {
  videoUrl = url;
};

const getStatus = () => {
  return status;
};

module.exports = {
  play,
  pause,
  setCurrentTime,
  getCurrentTime,
  getVideoUrl,
  setVideoUrl,
  getStatus,
};

const moment = require("moment");

exports.isEmailValid = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.generateRandomTime = () => {
  const randomHour = Math.floor(Math.random() * 12);
  const randomMinute = Math.floor(Math.random() * 60);
  const amOrPm = Math.random() < 0.5 ? "AM" : "PM";
  const randomTime =
    moment({ hour: randomHour, minute: randomMinute }).format("hh:mm") +
    " " +
    amOrPm;

  return randomTime;
};

const mongoose = require("mongoose");
const User = mongoose.model("User");

exports.login = async (req, res, next) => {
  console.log("login request handler");
  res.json({ success: "OK" });
};

exports.createUser = async (req, res, next) => {
  console("create user handler");
  const user = await User.create(req.body);
  next();
};

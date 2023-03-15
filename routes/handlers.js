const mongoose = require("mongoose");
const User = mongoose.model("User");

//Login
exports.login = async (req, res, next) => {
  console.log("login request handler");
  res.json({ success: "OK" });
};

//Creating User
exports.createUser = async (req, res, next) => {
  console.log("create user handler");
  const user = await User.create(req.body);
  res.json(req.body);
  next();
};

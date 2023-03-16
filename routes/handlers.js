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

//Get All Users
exports.getUsers = async (req, res, next) => {
  console.log("get users handler");
  const users = await User.find({}).sort({ createdAt: -1 });
  res.status(200).json(users);
};

//get a Single user
exports.getUser = async (req, res, next) => {
  console.log("get a user ");
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such data:id" });
  }
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: "No user Found" });
  }

  res.status(200).json(user);
};

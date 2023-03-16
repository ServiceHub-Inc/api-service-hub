const mongoose = require("mongoose");
const User = mongoose.model("User");
const uuid = require("uuid");

//Login
exports.login = async (req, res, next) => {
  console.log("login request handler");
  res.json({ success: "OK" });
};

//Creating User
exports.createUser = async (req, res, next) => {
  console.log("create user handler");
  // const { firstName, lastName, email, phone, password } = req.body;

  try {
    const userData = req.body;
    const verificationToken = uuid.v4(); // generate a unique verification token
    const rememberToken = uuid.v4(); // generate a unique remember token
    const user = await User.create({
      ...userData,
      verification_token: verificationToken,
      remember_token: rememberToken,
    });

    res.status(200).json(user);
    console.log("successfully submitted");
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log("hmm something happened");
  }

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

//Delete a user
exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such data:id" });
  }

  const user = await User.findOneAndDelete({ _id: id });
  if (!user) {
    return res.status(400).json({ error: "No user Found" });
  }

  res.status(200).json(user);
};

const mongoose = require("mongoose");
const User = mongoose.model("User");
const uuid = require("uuid");
const multer = require("multer");

//Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, uuid.v4() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

//Login
exports.login = async (req, res, next) => {
  console.log("login request handler");
  res.json({ success: "OK" });
};

//Creating User
exports.createUser = async (req, res, next) => {
  console.log("Create user handler");
  try {
    upload.single("image")(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const userData = req.body;
      const verificationToken = uuid.v4();
      const rememberToken = uuid.v4();

      const user = await User.create({
        ...userData,
        image: req.file.filename,
        verification_token: verificationToken,
        remember_token: rememberToken,
      });

      res.status(200).json(user);
    });
  } catch (error) {
    next(error);
  }
};

//

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

//
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

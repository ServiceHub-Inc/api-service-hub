const mongoose = require("mongoose");
const User = mongoose.model("User");
const path = require("path");
const uuid = require("uuid");
const multer = require("multer");

//Login
exports.login = async (req, res, next) => {
  console.log("login request handler");
  res.json({ success: "OK" });
};

//Setting Up Multer MiddleWare
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, uuid.v4() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

exports.createUser = async (req, res, next) => {
  console.log("Create user handler");
  // Check if required fields are present
  const requiredFields = [
    "firstName",
    "lastName",
    "userRole",
    "email",
    "city",
    "address",
    "phone",
    "password",
  ];
  // const missingFields = requiredFields.filter((field) => !(field in req.body));
  // if (missingFields.length > 0) {
  //   return res
  //     .status(400)
  //     .json({ error: `Missing required fields: ${missingFields.join(", ")}` });
  // }

  try {
    upload.single("image")(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          error: err.message,
          cMsg: "Error creating user",
        });
      }

      //Assigning file properties
      const file = req.file;
      const baseUrl = `${req.protocol}://${req.headers.host}`;
      const imageUrl = `${baseUrl}/uploads/${file.filename}`; // get the path of the uploaded image

      const { email, phone } = req.body;

      // Checking if email or phone already exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          error: "Email already exists",
          cMsg: "Error creating user",
        });
      }
      //Checking if phone exists
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          error: "Phone number already exists",
          cMsg: "Error creating user",
        });
      }

      const userData = req.body;
      const verificationToken = uuid.v4();
      const rememberToken = uuid.v4();
      const user = await User.create({
        ...userData,
        image: file.filename,
        imageUrl,
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

//Update user
exports.updateUser = async (req, res, next) => {
  console.log("update a user ");
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such data:id" });
  }

  const user = await User.findOneAndUpdate(
    { _id: id },
    {
      ...req.body,
    },
  );
  if (!user) {
    return res.status(400).json({ error: "No data Found" });
  }

  res.status(200).json(user);
  console.log(id);
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

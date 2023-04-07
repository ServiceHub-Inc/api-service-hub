const mongoose = require("mongoose");
const Admin = mongoose.model("Admin");
const uuid = require("uuid");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();

//Setting Up Multer MiddleWare
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, uuid.v4() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

exports.loginAdmin = async (req, res, next) => {
  try {
    console.log("logging in");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ error: "All fields required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(400)
        .json({ message: "The email or password you entered is incorrect" });
    }

    const matching = await admin.authenticate(password);
    if (!matching) {
      return res
        .status(400)
        .json({ message: "The email or password you entered is incorrect" });
    }

    const { password: pass, ...rest } = admin;
    return res.status(200).json(rest);
  } catch (error) {
    return res.status(error.status || 401).json({ message: error.message });
  }
};

//Creating an Admin
exports.createAdmin = async (req, res, next) => {
  console.log("Create admin handler");

  try {
    upload.single("image")(req, res, async function (err) {
      if (err) {
        return res
          .status(400)
          .json({ error: err.message, cMsg: "Error creating admin" });
      }

      //Assigning file properties
      const file = req.file;
      const imageUrl = `uploads/${file?.filename}`; // get the path of the uploaded image

      const { email, phone } = req.body;

      // Checking if email or phone already exists
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          error: "Email already exists",
          cMsg: "Error creating admin",
        });
      }
      //Checking if phone exists
      const phoneExists = await Admin.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          error: "Phone number already exists",
          cMsg: "Error creating admin",
        });
      }

      const adminData = req.body;
      const rememberToken = uuid.v4();
      const admin = await Admin.create({
        ...adminData,
        image: file?.filename,
        imageUrl,
        remember_token: rememberToken,
      });

      res.status(200).json(admin);
    });
  } catch (error) {
    next(error);
  }
};

//testing email
exports.sendMail = async (req, res, next) => {
  // const { email } = req.body;
  // const user = new User({ email, confirmed: false });
  // await user.save();

  console.log("email Sending");

  const email = "ghservicehub@gmail.com";
  const name = "Frank Thomas";
  const confirmationCode = uuid.v4();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const html = `
    <html>
      <head>
        <style>
          .header {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100px;
            background-color: #f2f2f2;
          }
          .header img {
            width: 50px;
            height: 50px;
            margin-right: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://images.unsplash.com/photo-1553835973-dec43bfddbeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGxvZ29zfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60" alt="Logo">
          <h1>Email Confirmation</h1>
        </div>
        <p>Hello ${name}, this is a test email from ServiceHUB</p>
        <p>Please confirm your email by clicking on the following link</p>
        <a href=http://localhost:3008/confirm/${confirmationCode}> Click here</a>
      </body>
    </html>
  `;

  const mailOptions = {
    from: "ServiceHub <dennisagbokpe@gmail.com>",
    to: email, // list of receivers
    subject: "Confirm your registration", // Subject line
    html, // html body
  };

  await transporter.sendMail(mailOptions);
  res.send("Successfully Sent");
  console.log("email Sent");
};

//Confirm / Verify user
exports.ConfirmUser = async (req, res, next) => {
  console.log("confirming user");
};

//Get All Admins
exports.getAdmins = async (req, res, next) => {
  console.log("get admin handler");
  const admins = await Admin.find({}).sort({ createdAt: -1 });
  res.status(200).json(admins);
};

//Get a Single Admin
exports.getAdmin = async (req, res, next) => {
  console.log("get an admin ");
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such data:id" });
  }
  const admin = await Admin.findById(id);
  if (!admin) {
    return res.status(404).json({ error: "Admin account not found" });
  }

  res.status(200).json(admin);
};

// Change Admin Role
exports.changeAdminRole = async (req, res) => {
  console.log("change admin role");

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such data:id" });
  }

  const admin = await Admin.findByIdAndUpdate(id, { role: req.body.role });

  if (admin) {
    return res.status(200).json(admin);
  }
};

//Delete an Admin
exports.deleteAdmin = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such data:id" });
  }

  const admin = await Admin.findOneAndDelete({ _id: id });
  if (!admin) {
    return res.status(400).json({ error: "Admin Account not found" });
  }

  res.status(200).json(admin);
};

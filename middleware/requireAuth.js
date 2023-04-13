const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Admin = mongoose.model("Admin");

const requireAuth = async (req, res, next) => {
  //Verify Authentication
  const { authorization } = req.headers;

  //Checking if authorization exist
  if (!authorization) {
    return res.status(401).json({
      error: "Authorization Token REQUIRED!!",
      msg: " --Careful-- | Fiscolity!👨‍💻🕵️‍♂️",
    });
  }

  const token = authorization.split(" ")[1];

  //Verifying the token and ID
  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findOne({ _id }).select("_id");
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Request is NOT Authorized!!" });
  }
};

module.exports = requireAuth;

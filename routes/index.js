const {
  createAdmin,
  loginAdmin,
  getAdmins,
  getAdmin,
  sendMail,
  deleteAdmin,
  updateAdmin,
  ConfirmAdmin,
  refreshToken,
} = require("./admin.handlers");
const {
  createUser,
  login,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  confirmUserEmail,
  verifySuccess,
  ejsPage,
  resetPassword,
} = require("./users.handlers");

const requireAuth = require("../middleware/requireAuth");

module.exports = (app) => {
  app.get("/", (req, res, next) => {
    console.log("request sent to / route");
    res.json({ success: "OK" });
  });

  //Login user
  app.post("/login", login);

  //Reset User Pass
  app.post("/reset-user-password", resetPassword);

  //Create a User
  app.post("/create-user", createUser);

  //Get all Users
  app.get("/users", getUsers);

  //Get a user
  app.get("/user/:id", getUser);

  //Update a User
  app.patch("/user/:id", updateUser);

  //Delete a User
  app.delete("/user/:id", deleteUser);

  //Confirm User Email
  app.get("/confirm", confirmUserEmail);

  //Successful Sign UP
  app.get("/thankyou", verifySuccess);

  //Ejs TestPage
  app.get("/testing", ejsPage);

  // --------------------------------------ADMIN ROUTES-------------------------------//

  //Create an Admin
  app.post("/create-admin", createAdmin);

  //login an Admin
  app.post("/admin/login", loginAdmin);

  app.post("/admin/refresh-token", refreshToken);

  //---------------PROTECTED REQUESTS--------------------

  //Using Auth MiddleWare
  app.use(requireAuth);

  //Get all Admins
  app.get("/admins/", getAdmins);

  //Get an Admin
  app.get("/admin/:id", getAdmin);

  //Delete an Admin
  app.delete("/admin/:id", deleteAdmin);

  //Update an Admin
  app.patch("/admin/:id", updateAdmin);

  //Verify
  app.get("/confirm/:confirmationCode", ConfirmAdmin);
};

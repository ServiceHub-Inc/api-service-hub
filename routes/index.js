const {
  createAdmin,
  loginAdmin,
  getAdmins,
  getAdmin,
} = require("./admin.handlers");
const {
  createUser,
  login,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
} = require("./users.handlers");

module.exports = (app) => {
  app.get("/", (req, res, next) => {
    console.log("request sent to / route");
    res.json({ success: "OK" });
  });

  //Login user
  app.post("/login", login);

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

  // --------------------------------------ADMIN ROUTES-------------------------------//

  //Create an Admin
  app.post("/create-admin", createAdmin);

  //login an Admin
  app.post("/admin/login", loginAdmin);

  //Get all Admins
  app.get("/admins/", getAdmins);

  //Get an Admin
  app.get("/admin/:id", getAdmin);
};

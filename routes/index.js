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

  app.post("/login", login);

  app.post("/create-user", createUser);

  app.get("/users", getUsers);

  //Get a user
  app.get("/user/:id", getUser);

  //Update a User
  app.patch("/user/:id", updateUser);

  //Delete a user
  app.delete("/user/:id", deleteUser);
};

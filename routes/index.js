const { createUser, login, getUsers, getUser } = require("./handlers");

module.exports = (app) => {
  app.get("/", (req, res, next) => {
    console.log("request sent to / route");
    res.json({ success: "OK" });
  });

  app.post("/login", login);

  app.post("/create-user", createUser);

  app.get("/users", getUsers);

  app.get("/:id", getUser);
};

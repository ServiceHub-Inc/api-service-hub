exports.login = async (req, res, next) => {
  console.log("login request handler");
  res.json({ success: "OK" });
};

exports.createUser = async (req, res, next) => {
  console("create user handler");
  res.json({ success: "OK" });
};

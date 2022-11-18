const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", () => console.log("Error: Database connection failed!!!"));
db.on("open", () => console.log("Success: Database connected successfully"));

const app = express();

app.listen(3008, () => {
  console.log("Server has started on PORT 3008");
});

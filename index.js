// Import Statements
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Creating an Express server
const app = express();

// Serve uploaded images
app.use("/uploads", express.static("public/uploads"));

// Connecting to the Database
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", () => console.log("Error: Database connection failed!!!"));
db.on("open", () => console.log("Success: Database connected successfully"));

// Middleware
app.use(cors());
app.use(express.json());

require("./models");
require("./routes")(app);

// Invoking the server to listen
app.listen(process.env.DEV_PORT, () => {
  console.log(`Server has started on PORT ${process.env.DEV_PORT}`);
});

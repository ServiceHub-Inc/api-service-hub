const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Please enter your first name"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "Please enter your last name"],
      trim: true,
    },
    user_role: {
      type: String,
      required: true,
      enum: ["ADMIN", "STAFF", "AGENT", "CLIENT", "PROVIDER"],
      default: "CLIENT",
    },
    email: {
      type: String,
      required: [true, "Please enter a valid email"],
      unique: [true, "Email already exists"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please enter your phone number"],
      unique: [true, "Number already exists"],
      trim: true,
    },
    image: {
      type: String,
    },
    email_verified_at: {
      type: Date,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    verification_token: {
      type: String,
      unique: [true, "Number already exists"],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
    },
    created_by: {
      type: Number,
    },
    remember_token: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

mongoose.model("User", UserSchema);

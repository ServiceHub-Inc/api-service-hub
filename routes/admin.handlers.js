const mongoose = require("mongoose");
const Admin = mongoose.model("Admin");
const uuid = require("uuid");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

//Creating a Token function
const createToken = (_id, expiresIn) => {
	return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn });
};

const createRefreshToken = (_id) => {
	return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "3d" }); // Refresh token expiration: 7 days
};

//
//Setting Up Multer MiddleWare
const storage = multer.diskStorage({
	destination: "./public/uploads/",
	filename: function (req, file, cb) {
		cb(null, uuid.v4() + "-" + file.originalname);
	},
});
const upload = multer({ storage: storage });

exports.loginAdmin = async (req, res, next) => {
	console.log("logging in");
	try {
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
			if (admin.login_attempts < 5) {
				// record the login_attempts
				Admin.updateOne(
					{ id: admin._id },
					{ login_attempts: admin.login_attempts + 1 }
				);

				return res
					.status(400)
					.json({ message: "The email or password you entered is incorrect" });
			} else {
				return res.status(400).json({
					message:
						"Too many failed login attempts. Please try again after 30 minutes",
				});
			}
		}

		// record the last_login
		Admin.updateOne(
			{ id: admin._id },
			{ login_attempts: 0, last_login: Date.now() }
		);

		// Token expiration time (in seconds)
		const expiresIn = 3600; // 1 hour

		// Add a token
		const token = createToken(admin._id, expiresIn);

		// Calculate tokenValidity in milliseconds
		const tokenValidity = Date.now() + expiresIn * 1000;

		const { password: pass, ...rest } = admin;
		return res.status(200).json({ admin, token, tokenValidity });
	} catch (error) {
		return res.status(error.status || 401).json({ message: error.message });
	}
};

//Creating an Admin
exports.createAdmin = async (req, res, next) => {
	console.log("Creating an Admin");

	try {
		upload.single("image")(req, res, async function (err) {
			if (err) {
				return res
					.status(400)
					.json({ error: err.message, cMsg: "Error creating admin" });
			}

			//Assigning file properties
			const file = req.file;

			file ? (imageUrl = `uploads/${file?.filename}`) : (imageUrl = null); // get the path of the uploaded image

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

			// Token expiration time (in seconds)
			const expiresIn = 3600; // 1 hour

			// Add a token
			const token = createToken(admin._id, expiresIn);
			const refreshToken = createRefreshToken(admin._id);

			// Calculate tokenValidity in milliseconds
			const tokenValidity = Date.now() + expiresIn * 1000;

			res.status(200).json({ admin, token, tokenValidity, refreshToken });
		});
	} catch (error) {
		next(error);
	}
};

//-----------------REFRESH TOKENS-------------------------------------//
exports.refreshToken = async (req, res, next) => {
	console.log("Refreshing Tokens");
	const { refreshToken } = req.body;

	if (!refreshToken) {
		return res.status(400).json({ error: "Refresh token is required" });
	}

	try {
		const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
		const admin = await Admin.findById(decoded._id);

		if (!admin) {
			return res.status(404).json({ error: "Admin not found" });
		}

		const expiresIn = 3600; // 1 hour
		const token = createToken(admin._id, expiresIn);
		const tokenValidity = Date.now() + expiresIn * 1000;

		res.status(200).json({ token, tokenValidity });
	} catch (error) {
		res.status(401).json({ error: "Invalid or expired refresh token" });
	}
};

//Confirm / Verify user
exports.ConfirmAdmin = async (req, res, next) => {
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

//Update Admin
exports.updateAdmin = async (req, res, next) => {
	console.log("update an Admin");
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: "No such data:id" });
	}

	const admin = await Admin.findOneAndUpdate(
		{ _id: id },
		{
			...req.body,
		}
	);
	if (!admin) {
		return res.status(400).json({ error: "No data Found" });
	}

	res.status(200).json(admin);
};
//

//Delete an Admin
exports.deleteAdmin = async (req, res, next) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: "No such data:id" });
	}

	const admin = await Admin.findOne({ _id: id });
	if (!admin) {
		return res.status(400).json({ error: "No Admin Account Found" });
	}

	// Delete the user's profile image
	if (admin.imageUrl) {
		const publicPath = path.join(__dirname, "..", "public");
		const imagePath = path.join(publicPath, admin.imageUrl);
		const fixedImagePath = imagePath.replace(/\\\\/g, "/");

		// Uncomment the following line to delete the image
		deleteProfileImage(fixedImagePath);
	}

	// Delete the user from the database
	await Admin.deleteOne({ _id: id });

	res.status(200).json(admin);
};

function deleteProfileImage(imagePath) {
	fs.unlink(imagePath, (err) => {
		if (err) {
			console.error(`Error deleting image: ${err.message}`);
		} else {
			console.log(`Image deleted: ${imagePath}`);
		}
	});
}

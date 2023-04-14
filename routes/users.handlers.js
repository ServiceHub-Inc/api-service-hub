const mongoose = require("mongoose");
const User = mongoose.model("User");
const uuid = require("uuid");
const multer = require("multer");
const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const emailTemplatePath = path.join(
	__dirname,
	"..",
	"templates",
	"confirmation-email.hbs"
);

//Delete image function

//
const emailTemplate = fs.readFileSync(emailTemplatePath, "utf8");

const compiledEmailTemplate = Handlebars.compile(emailTemplate);

//Login
exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return Util.error("All fields required", next);
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(400)
				.json({ message: "The email or password you entered is incorrect" });
		}

		const matching = await user.authenticate(password);
		if (!matching) {
			if (user.login_attempts < 5) {
				// record the login_attempts
				User.updateOne(
					{ id: user._id },
					{ login_attempts: user.login_attempts + 1 }
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
		User.updateOne(
			{ id: user._id },
			{ login_attempts: 0, last_login: Date.now() }
		);

		// req.session.userId = user._id;
		const { password: pass, login_attempts: loginAttempts, rest } = user;
		return res.status(200).json(rest);
	} catch (error) {
		return res.status(error.status || 401).json({ message: error.message });
	}
};

//Setting Up Multer MiddleWare
const storage = multer.diskStorage({
	destination: "./public/uploads/",
	filename: function (req, file, cb) {
		cb(null, uuid.v4() + "-" + file.originalname);
	},
});
const upload = multer({ storage: storage });

exports.createUser = async (req, res, next) => {
	console.log("Create user handler");
	try {
		upload.single("image")(req, res, async function (err) {
			if (err) {
				return res.status(400).json({
					error: err.message,
					cMsg: "Error creating user",
				});
			}

			//Assigning file properties
			const file = req.file;
			const baseUrl = `${req.protocol}://${req.headers.host}`;
			file ? (imageUrl = `uploads/${file?.filename}`) : (imageUrl = null); // get the path of the uploaded image

			const { email, phone } = req.body;

			// Checking if email or phone already exists
			const emailExists = await User.findOne({ email });
			if (emailExists) {
				return res.status(400).json({
					error: "Email already exists",
					cMsg: "Error creating user",
				});
			}
			//Checking if phone exists
			const phoneExists = await User.findOne({ phone });
			if (phoneExists) {
				return res.status(400).json({
					error: "Phone number already exists",
					cMsg: "Error creating user",
				});
			}

			const userData = req.body;
			const verificationToken = uuid.v4();
			const rememberToken = uuid.v4();
			const user = await User.create({
				...userData,
				image: file?.filename,
				imageUrl,
				verification_token: verificationToken,
				remember_token: rememberToken,
			});

			//Emailing the user
			console.log("email Sending");
			const transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT,
				secure: false, // true for 465, false for other ports
				auth: {
					user: process.env.SMTP_USERNAME,
					pass: process.env.SMTP_PASSWORD,
				},
			});

			const mailOptions = {
				from: "ServiceHub <dennisagbokpe@gmail.com>",
				to: email, // list of receivers
				subject: "Please Confirm Your Email Address", // Subject line
				html: compiledEmailTemplate({
					firstName: userData.firstName,
					confirmUrl: `${baseUrl}/confirm?token=${user.verification_token}`,
				}), // html body
			};

			await transporter.sendMail(mailOptions);
			console.log("email Sent");

			res.status(200).json(user);
		});
	} catch (error) {
		next(error);
	}
};

//
exports.confirmUserEmail = async (req, res, next) => {
	console.log("Confirming User");
	try {
		const { token } = req.query;
		const user = await User.findOne({ verification_token: token });

		if (!user) {
			return res.status(400).json({
				error: "Invalid token, please contact admin",
			});
		}

		user.is_email_verified = true;
		user.verification_token += " Verified";
		await user.save();

		// Render the successful activation page using EJS
		const viewPath = path.join(
			__dirname,
			"../views/emailActivationSuccess.ejs"
		);
		const html = await ejs.renderFile(viewPath);

		res.status(200).send(html);
	} catch (error) {
		next(error);
	}
};

//just testing Ejs Pages
exports.ejsPage = async (req, res, next) => {
	console.log("EJS Page Test");
	const viewPath = path.join(__dirname, "../views/emailActivationSuccess.ejs");
	const html = await ejs.renderFile(viewPath);

	res.status(200).send(html);
};

exports.verifySuccess = async (req, res, next) => {
	console.log("Successful Activation");
	res.send("Thank you for verifying your email!");
};

//
//Get All Users
exports.getUsers = async (req, res, next) => {
	console.log("get users handler");
	const users = await User.find({}).sort({ createdAt: -1 });
	res.status(200).json(users);
};

//get a Single user
exports.getUser = async (req, res, next) => {
	console.log("get a user ");
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: "No such data:id" });
	}
	const user = await User.findById(id);
	if (!user) {
		return res.status(404).json({ error: "No user Found" });
	}

	res.status(200).json(user);
};
//

//Update user
exports.updateUser = async (req, res, next) => {
	console.log("update a user ");
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: "No such data:id" });
	}

	const user = await User.findOneAndUpdate(
		{ _id: id },
		{
			...req.body,
		}
	);
	if (!user) {
		return res.status(400).json({ error: "No data Found" });
	}

	res.status(200).json(user);
	console.log(id);
};
//
// Delete a user
exports.deleteUser = async (req, res, next) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: "No such data:id" });
	}

	const user = await User.findOne({ _id: id });
	if (!user) {
		return res.status(400).json({ error: "No user Found" });
	}

	// Delete the user's profile image
	if (user.imageUrl) {
		const publicPath = path.join(__dirname, "..", "public");
		const imagePath = path.join(publicPath, user.imageUrl);
		const fixedImagePath = imagePath.replace(/\\\\/g, "/");

		// Uncomment the following line to delete the image
		deleteProfileImage(fixedImagePath);
	}

	// Delete the user from the database
	await User.deleteOne({ _id: id });

	res.status(200).json(user);
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

//
exports.resetPassword = async (req, res, next) => {
	console.log("Resetting Password");
	try {
		// Extract email and new password from request body
		const { email, password } = req.body;

		// Check if user with email exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		// Use changePassword method to update user's password
		user.changePassword(password, (err) => {
			if (err) {
				return res.status(500).json({ error: "Password update failed" });
			}

			//Reset user's reset password token

			//user.reset_password_token = null;
			user.save();

			// Send password reset confirmation email

			// Return success response
			return res.status(200).json({ message: "Password reset successful" });
		});
	} catch (error) {
		next(error);
	}
};

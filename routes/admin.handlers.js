const mongoose = require("mongoose");
const Admin = mongoose.model("Admin");
const uuid = require("uuid");
const multer = require("multer");

//Setting Up Multer MiddleWare
const storage = multer.diskStorage({
	destination: "./public/uploads/",
	filename: function (req, file, cb) {
		cb(null, uuid.v4() + "-" + file.originalname);
	},
});
const upload = multer({ storage: storage });

// Admin Login
exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return Util.error("All fields required", next);
		}

		const admin = await Admin.findOne({ email });
		if (!admin) {
			return res
				.status(400)
				.json({ message: "The email or password you entered is incorrect" });
		}

		const matching = await admin.authenticate(password);
		if (!matching) {
			return res
				.status(400)
				.json({ message: "The email or password you entered is incorrect" });
		}

		// req.session.userId = user._id;
		const { password: pass, ...rest } = admin;
		return res.status(200).json(rest);
	} catch (error) {
		return res.status(error.status || 401).json({ message: error.message });
	}
};

//Creating an Admin
exports.createAdmin = async (req, res, next) => {
	console.log("Create admin handler");

	try {
		upload.single("image")(req, res, async function (err) {
			if (err) {
				return res
					.status(400)
					.json({ error: err.message, cMsg: "Error creating admin" });
			}

			//Assigning file properties
			const file = req.file;
			const imageUrl = `uploads/${file.filename}`; // get the path of the uploaded image

			const adminData = req.body;
			const rememberToken = uuid.v4();
			const admin = await Admin.create({
				...adminData,
				image: file.filename,
				imageUrl,
				remember_token: rememberToken,
			});

			res.status(200).json(admin);
		});
	} catch (error) {
		next(error);
	}
};

//

//Get All Admins
exports.getAdmins = async (req, res, next) => {
	console.log("get admin handler");
	const admin = await Admin.find({}).sort({ createdAt: -1 });
	res.status(200).json(admin);
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

//Delete an Admin
exports.deleteAdmin = async (req, res, next) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: "No such data:id" });
	}

	const admin = await Admin.findOneAndDelete({ _id: id });
	if (!admin) {
		return res.status(400).json({ error: "Admin Account not found" });
	}

	res.status(200).json(admin);
};

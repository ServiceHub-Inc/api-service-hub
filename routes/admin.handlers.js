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
	console.log("login request handler");
	res.json({ success: "OK" });
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
	console.log("get users handler");
	const users = await Admin.find({}).sort({ createdAt: -1 });
	res.status(200).json(users);
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

const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, "Please enter your first name"],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, "Please enter your last name"],
			trim: true,
		},
		userRole: {
			type: String,
			required: true,
			enum: ["CLIENT", "PROVIDER"],
			default: "CLIENT",
		},
		idType: {
			type: String,
			required: true,
			default: "N/A",
		},
		email: {
			type: String,
			required: [true, "Please enter a valid email"],
			unique: [true, "Email already exists"],
			trim: true,
		},
		city: {
			type: String,
			required: [true, "Please enter your city"],
			trim: true,
		},
		address: {
			type: String,
			required: [true, "Please enter your address"],
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
		imageUrl: { type: String },
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

UserSchema.pre("save", function (next) {
	const user = this;

	if (this.isModified("password") || this.isNew) {
		bcrypt.genSalt(10, function (saltError, salt) {
			if (saltError) {
				return next(saltError);
			} else {
				bcrypt.hash(user.password, salt, function (hashError, hash) {
					if (hashError) {
						return next(hashError);
					}

					user.password = hash;
					next();
				});
			}
		});
	} else {
		return next();
	}
});

UserSchema.methods.changePassword = (password, next) => {
	const user = this;

	bcrypt.genSalt(10, function (saltError, salt) {
		if (saltError) {
			return next(saltError);
		} else {
			bcrypt.hash(password, salt, function (hashError, hash) {
				if (hashError) {
					return next(hashError);
				}

				user.password = hash;
				// user.save();
				next();
			});
		}
	});
};

UserSchema.methods.authenticate = async function (candidatePassword, callback) {
	if (!callback) return bcrypt.compare(candidatePassword, this.password);

	bcrypt.compare(candidatePassword, this.password, function (err, matching) {
		if (err) return callback(err);
		return callback(null, matching);
	});
};

const AdminSchema = mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, "Please enter your first name"],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, "Please enter your last name"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Please enter a valid email"],
			unique: [true, "Email already exists"],
			trim: true,
		},
		role: {
			type: String,
			required: true,
			enum: ["ADMIN", "STAFF", "AGENT"],
			default: "STAFF",
		},
		phone: {
			type: String,
			required: [true, "Please enter your phone number"],
			unique: [true, "Number already exists"],
			trim: true,
		},
		password: {
			type: String,
			required: [true, "Please enter a password"],
		},
		image: {
			type: String,
		},
		imageUrl: { type: String },
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

AdminSchema.pre("save", function (next) {
	const admin = this;

	if (this.isModified("password") || this.isNew) {
		bcrypt.genSalt(10, function (saltError, salt) {
			if (saltError) {
				return next(saltError);
			} else {
				bcrypt.hash(admin.password, salt, function (hashError, hash) {
					if (hashError) {
						return next(hashError);
					}

					admin.password = hash;
					next();
				});
			}
		});
	} else {
		return next();
	}
});

AdminSchema.methods.changePassword = (password, next) => {
	const admin = this;

	bcrypt.genSalt(10, function (saltError, salt) {
		if (saltError) {
			return next(saltError);
		} else {
			bcrypt.hash(password, salt, function (hashError, hash) {
				if (hashError) {
					return next(hashError);
				}

				admin.password = hash;
				// user.save();
				next();
			});
		}
	});
};

AdminSchema.methods.authenticate = async function (
	candidatePassword,
	callback
) {
	if (!callback) return bcrypt.compare(candidatePassword, this.password);

	bcrypt.compare(candidatePassword, this.password, function (err, matching) {
		if (err) return callback(err);
		return callback(null, matching);
	});
};

mongoose.model("User", UserSchema);
mongoose.model("Admin", AdminSchema);

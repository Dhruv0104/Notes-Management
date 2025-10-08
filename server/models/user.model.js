const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true }, // Consider hashing before saving!
		role: { type: String, required: true, enum: ['ADMIN', 'USER'] },
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	}
);

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;

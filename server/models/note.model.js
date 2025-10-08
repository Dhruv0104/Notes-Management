const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: true,
		},
		title: { type: String, required: true },
		description: { type: String, required: true },
		tags: [{ type: String }],
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	}
);

const noteModel = mongoose.model('notes', noteSchema);
module.exports = noteModel;

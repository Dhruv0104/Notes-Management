const noteModel = require('../models/note.model');

async function addNote(req, res) {
	const { title, description, tags } = req.body;

	if (!title || !description) {
		return res
			.status(400)
			.json({ success: false, message: 'Title and description are required' });
	}

	// ✅ Check if note with same title exists for this user
	const existingNote = await noteModel.findOne({
		title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
		userId: res.locals.user._id,
	});

	if (existingNote) {
		return res
			.status(400)
			.json({ success: false, message: 'A note with this title already exists' });
	}

	// ✅ If not exist, create new
	const newNote = new noteModel({
		title: title.trim(),
		description,
		tags,
		userId: res.locals.user._id,
	});

	await newNote.save();

	return res.status(201).json({
		success: true,
		message: 'Note added successfully',
		note: newNote,
	});
}

async function getNotes(req, res) {
	const notes = await noteModel
		.find({ userId: res.locals.user._id, isActive: true })
		.sort({ updatedAt: -1 });
	return res.json({ success: true, notes });
}

async function getNoteById(req, res) {
	const { noteId } = req.params;
	const note = await noteModel.findOne({ _id: noteId, userId: res.locals.user._id });
	if (!note) {
		return res.status(404).json({ success: false, message: 'Note not found' });
	}
	return res.json({ success: true, note });
}

async function updateNote(req, res) {
	const { noteId } = req.params;
	const { title, description, tags } = req.body;

	const updatedNote = await noteModel.findOneAndUpdate(
		{ _id: noteId, userId: res.locals.user._id },
		{ title, description, tags },
		{ new: true }
	);

	if (!updatedNote) {
		return res.status(404).json({ success: false, message: 'Note not found' });
	}

	return res.json({ success: true, message: 'Note updated successfully', note: updatedNote });
}

async function deleteNote(req, res) {
	const { noteId } = req.params;
	const deletedNote = await noteModel.findOneAndUpdate(
		{ _id: noteId, userId: res.locals.user._id },
		{ isActive: false },
		{ new: true }
	);
	if (!deletedNote) {
		return res.status(404).json({ success: false, message: 'Note not found' });
	}

	return res.json({ success: true, message: 'Note deleted successfully', note: deletedNote });
}

module.exports = { addNote, getNotes, getNoteById, updateNote, deleteNote };

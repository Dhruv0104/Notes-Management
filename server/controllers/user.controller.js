const prisma = require('../utils/prisma');

async function addNote(req, res) {
	const { title, description, tags } = req.body;

	if (!title || !description) {
		return res
			.status(400)
			.json({ success: false, message: 'Title and description are required' });
	}

	// ✅ Check if note with same title exists for this user
	const existingNote = await prisma.note.findFirst({
		where: { title: title.trim(), userId: res.locals.user.id },
	});

	if (existingNote) {
		return res
			.status(400)
			.json({ success: false, message: 'A note with this title already exists' });
	}

	// ✅ If not exist, create new
	const newNote = await prisma.note.create({
		data: { title, description, tags, userId: res.locals.user.id },
	});

	return res.status(201).json({
		success: true,
		message: 'Note added successfully',
		note: newNote,
	});
}

async function getNotes(req, res) {
	const notes = await prisma.note.findMany({
		where: { userId: res.locals.user.id, isActive: true },
		orderBy: { updatedAt: 'desc' },
	});
	return res.json({ success: true, notes });
}

async function getNoteById(req, res) {
	const { noteId } = req.params;
	const note = await noteModel.findOne({ id: noteId, userId: res.locals.user.id });
	if (!note) {
		return res.status(404).json({ success: false, message: 'Note not found' });
	}
	return res.json({ success: true, note });
}

async function updateNote(req, res) {
	const { noteId } = req.params;
	const { title, description, tags } = req.body;

	try {
		// Ensure the note belongs to user
		const note = await prisma.note.findFirst({
			where: { id: parseInt(noteId), userId: res.locals.user.id },
		});

		if (!note) {
			return res.status(404).json({ success: false, message: 'Note not found' });
		}

		const updatedNote = await prisma.note.update({
			where: { id: parseInt(noteId) },
			data: { title, description, tags },
		});

		return res.json({
			success: true,
			message: 'Note updated successfully',
			note: updatedNote,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, message: 'Failed to update note' });
	}
}

async function deleteNote(req, res) {
	const { noteId } = req.params;
	const deletedNote = await prisma.note.update({
		where: { id: parseInt(noteId) },
		data: { isActive: false },
	});
	if (!deletedNote) {
		return res.status(404).json({ success: false, message: 'Note not found' });
	}

	return res.json({ success: true, message: 'Note deleted successfully', note: deletedNote });
}

module.exports = { addNote, getNotes, getNoteById, updateNote, deleteNote };

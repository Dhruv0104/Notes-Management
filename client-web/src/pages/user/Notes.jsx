import React, { useEffect, useState, useRef } from 'react';
import { fetchGet, fetchPost } from '../../utils/fetch.utils';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Chips } from 'primereact/chips';
import PageLayout from '../../components/layout/PageLayout';

export default function Notes() {
	const [notes, setNotes] = useState([]);
	const [visible, setVisible] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [noteData, setNoteData] = useState({ title: '', description: '', tags: [] });
	const [selectedNote, setSelectedNote] = useState(null);
	const toast = useRef(null);

	useEffect(() => {
		loadNotes();
	}, []);

	const loadNotes = async () => {
		try {
			const res = await fetchGet({ pathName: 'user/fetch-notes' });
			if (res?.success) {
				setNotes(res.notes);
			}
		} catch (err) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to load notes',
			});
		}
	};

	// ✅ Add Note API
	const handleAddNote = async () => {
		if (!noteData.title || !noteData.description) {
			toast.current.show({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Title and Description are required',
			});
			return;
		}

		try {
			const body = {
				title: noteData.title,
				description: noteData.description,
				tags: noteData.tags.filter((t) => t.trim()), // just to clean empty tags
			};

			const res = await fetchPost({ pathName: 'user/add-note', body: JSON.stringify(body) });

			if (res?.success) {
				toast.current.show({
					severity: 'success',
					summary: 'Success',
					detail: 'Note added successfully',
				});
				setVisible(false);
				setNoteData({ title: '', description: '', tags: '' });
				loadNotes();
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: res.message || 'Failed to add note',
				});
			}
		} catch {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Something went wrong while adding note',
			});
		}
	};

	// ✅ Update Note API
	const handleUpdateNote = async () => {
		if (!noteData.title || !noteData.description) {
			toast.current.show({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Title and Description are required',
			});
			return;
		}

		try {
			const body = {
				title: noteData.title,
				description: noteData.description,
				tags: noteData.tags.filter((t) => t.trim()), // just to clean empty tags
			};

			const res = await fetchPost({
				pathName: `user/update-note/${selectedNote._id}`,
				body: JSON.stringify(body),
			});

			if (res?.success) {
				toast.current.show({
					severity: 'success',
					summary: 'Updated',
					detail: 'Note updated successfully',
				});
				setVisible(false);
				setEditMode(false);
				setNoteData({ title: '', description: '', tags: '' });
				setSelectedNote(null);
				loadNotes();
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: res.message || 'Failed to update note',
				});
			}
		} catch {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Something went wrong while updating note',
			});
		}
	};

	const handleEdit = (note) => {
		setEditMode(true);
		setVisible(true);
		setSelectedNote(note);
		setNoteData({
			title: note.title,
			description: note.description,
			tags: note.tags, // it's already an array
		});
	};

	const handleDelete = async (noteId) => {
		if (!window.confirm('Are you sure you want to delete this note?')) return;
		try {
			const res = await fetchPost({ pathName: `user/delete-note/${noteId}` });
			if (res?.success) {
				toast.current.show({
					severity: 'success',
					summary: 'Deleted',
					detail: 'Note deleted successfully',
				});
				loadNotes();
			}
		} catch {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to delete note',
			});
		}
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleString('en-IN', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	};

	const filteredNotes = notes.filter((note) => {
		const query = searchQuery.toLowerCase();

		// Check title
		const titleMatch = note.title.toLowerCase().includes(query);

		// Check description
		const descMatch = note.description.toLowerCase().includes(query);

		// Check tags
		const tagsMatch = note.tags.some((tag) => tag.toLowerCase().includes(query));

		// Check date (formatted)
		const dateStr = formatDate(note.updatedAt).toLowerCase();
		const dateMatch = dateStr.includes(query);

		return titleMatch || descMatch || tagsMatch || dateMatch;
	});

	return (
		<PageLayout>
			<Toast ref={toast} />
			<div className="flex flex-col items-center py-6 sm:py-10 px-3 sm:px-4">
				<div className="w-full max-w-5xl">
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
						<h1 className="text-2xl sm:text-3xl font-bold text-primary text-center sm:text-left">
							My Notes
						</h1>

						<div className="flex gap-2 w-full sm:w-auto">
							<InputText
								placeholder="Search by title, description, tag or date..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full sm:w-96" // increased width on larger screens
							/>
							<Button
								label="Add Note"
								icon="pi pi-plus"
								onClick={() => {
									setVisible(true);
									setEditMode(false);
									setNoteData({ title: '', description: '', tags: '' });
								}}
								className="bg-primary text-white px-3 py-2 rounded shadow-md hover:bg-[#2a547a]"
							/>
						</div>
					</div>

					{/* Notes Grid */}
					{filteredNotes.length === 0 ? (
						<p className="text-gray-600 text-center mt-10">No notes found. Add one!</p>
					) : (
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
							{filteredNotes.map((note) => (
								<div
									key={note._id}
									onClick={() => handleEdit(note)}
									className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition relative cursor-pointer overflow-hidden flex flex-col justify-between h-full"
								>
									{/* Top Section */}
									<div className="flex flex-col h-full">
										{/* Title */}
										<h2 className="text-xl font-semibold text-primary mb-2 break-words line-clamp-2 min-h-[3rem]">
											{note.title}
										</h2>

										{/* Description */}
										<p className="text-gray-700 mb-3 break-words line-clamp-3 flex-grow">
											{note.description}
										</p>

										{/* Tags */}
										{note.tags.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-auto mb-2">
												{note.tags.map((tag, i) => (
													<Tag
														key={i}
														value={tag}
														className="text-sm bg-blue-100 text-primary"
													/>
												))}
											</div>
										)}

										{/* Date */}
										<p className="text-xs text-gray-500 text-right">
											{formatDate(note.updatedAt)}
										</p>
									</div>

									{/* Delete Button */}
									<div className="absolute top-3 right-3">
										<Button
											icon="pi pi-trash"
											text
											className="text-red-500 hover:text-red-700"
											onClick={(e) => {
												e.stopPropagation();
												handleDelete(note._id);
											}}
										/>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Dialog for Add/Edit */}
				<Dialog
					header={editMode ? 'Edit Note' : 'Add Note'}
					visible={visible}
					style={{ width: '800px' }}
					onHide={() => setVisible(false)}
					draggable={false}
				>
					<div className="flex flex-col gap-3 scrollbar-hide">
						<label className="text-primary font-medium">Title</label>
						<InputText
							value={noteData.title}
							onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
							placeholder="Enter title"
						/>
						<label className="text-primary font-medium mt-2">Description</label>
						<InputTextarea
							value={noteData.description}
							onChange={(e) =>
								setNoteData({ ...noteData, description: e.target.value })
							}
							placeholder="Enter description"
							autoResize
							rows={3}
							className="w-full"
						/>

						<label className="text-primary font-medium mt-2">Tags</label>
						<Chips
							value={noteData.tags}
							onChange={(e) => setNoteData({ ...noteData, tags: e.value })}
							separator=","
							placeholder="  Type and press Enter"
						/>
						<Button
							label={editMode ? 'Update Note' : 'Add Note'}
							onClick={editMode ? handleUpdateNote : handleAddNote}
							className="mt-3 bg-primary text-white hover:bg-[#2a547a]"
						/>
					</div>
				</Dialog>
			</div>
		</PageLayout>
	);
}

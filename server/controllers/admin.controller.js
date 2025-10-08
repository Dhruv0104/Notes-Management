const userModel = require('../models/user.model');

async function getAllUsers(req, res) {
	const users = await userModel.find();
	res.json({ success: true, data: users });
}

async function getUserById(req, res) {
	const { userId } = req.params;
	const user = await userModel.findById(userId);
	if (!user) return res.status(404).json({ success: false, message: 'User not found' });
	res.json({ success: true, data: user });
}
async function createUser(req, res) {
	const { username, password, role } = req.body;
	if (!username || !password || !role) {
		return res
			.status(400)
			.json({ success: false, message: 'username, password and role required' });
	}
	const newUser = new userModel({ username, password, role });
	await newUser.save();
	res.status(201).json({ success: true, data: newUser });
}
async function updateUser(req, res) {
	const { userId } = req.params;
	const updates = req.body;
	const user = await userModel.findByIdAndUpdate(userId, updates, { new: true });
	if (!user) return res.status(404).json({ success: false, message: 'User not found' });
	res.json({ success: true, data: user });
}
async function deleteUser(req, res) {
	const { userId } = req.params;
	const user = await userModel.findByIdAndDelete(userId);
	if (!user) return res.status(404).json({ success: false, message: 'User not found' });
	res.json({ success: true, message: 'User deleted successfully' });
}
module.exports = {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
};

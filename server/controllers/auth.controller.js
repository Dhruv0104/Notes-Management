const jwt = require('jsonwebtoken');
const md5 = require('md5');
const prisma = require('../utils/prisma');
// const { sendResetPasswordEmail } = require('../utils/mailer');

async function login(req, res) {
	const { username, password } = req.body;

	if (!username || !password)
		return res.status(400).json({ success: false, message: 'username and password required' });

	let user = await prisma.user.findFirst({
		where: { username, password: md5(password) },
	});
	if (!user) return res.status(404).json({ message: 'User not found' });

	const token = jwt.sign(
		{
			id: user.id,
			permissions: user.permissions,
			role: user.role,
		},
		process.env.JWT_SECRET,
		{ expiresIn: '1d' }
	);

	res.json({
		success: true,
		data: {
			token,
			username: user.username,
			role: user.role,
			id: user.id,
		},
	});
}

async function register(req, res) {
	const { username, password } = req.body;
	if (!username || !password) {
		return res
			.status(400)
			.json({ success: false, message: 'username and password are required' });
	}
	const existingUser = await prisma.user.findUnique({ where: { username } });
	if (existingUser) {
		return res.status(409).json({ success: false, message: 'Username already exists' });
	}
	await prisma.user.create({
		data: { username, password: md5(password), role: 'USER' },
	});
	return res.status(201).json({ success: true, message: 'User registered successfully' });
}

async function logout(req, res) {
	await userModel.updateOne({ id: req.body.id }, { currentToken: null });
	res.clearCookie('auth');
	return res.json({ success: true });
}

async function forgotPassword(req, res) {
	const { username } = req.body;

	if (!username) {
		console.error('Forgot password error: Username missing');
		return res.status(400).json({ success: false, message: 'Username is required' });
	}

	try {
		const user = await userModel.findOne({ username });
		if (!user) {
			console.error(`Forgot password error: User not found for username ${username}`);
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		let profile = null;
		if (user.role === 'STUDENT') {
			profile = await studentModel.findOne({ userId: user.id });
			if (!profile) {
				console.error(
					`Forgot password error: Student profile not found for user ${user.id}`
				);
				return res
					.status(404)
					.json({ success: false, message: 'Student profile not found' });
			}
		} else if (user.role === 'AUTHORITY') {
			profile = await facultyModel.findOne({ userId: user.id });
			if (!profile) {
				console.error(
					`Forgot password error: Authority profile not found for user ${user.id}`
				);
				return res
					.status(404)
					.json({ success: false, message: 'Authority profile not found' });
			}
		}

		if (!profile.email) {
			console.error(
				`Forgot password error: Email not found for user ${username} with role ${user.role}`
			);
			return res
				.status(404)
				.json({ success: false, message: 'Email not found for this user' });
		}

		const newPassword = generateTempPassword();
		await userModel.updateOne(
			{ id: user.id },
			{ password: md5(newPassword) } // Hashing with md5 to match login logic
		);

		await sendResetPasswordEmail(profile.email, profile.fullname, username, newPassword);

		console.log(`Password reset email sent to ${profile.email} for username ${username}`);
		return res.json({
			success: true,
			message: 'Password reset email sent successfully',
		});
	} catch (error) {
		console.error('Forgot password error:', error.message, error.stack);
		return res
			.status(500)
			.json({ success: false, message: 'Failed to process password reset' });
	}
}

async function verify(req, res) {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) {
		return res.status(401).json({ error: 'Authorization token missing' });
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await prisma.user.findUnique({ where: { id: decoded.id } });
		if (!user || user.currentToken !== token) {
			return res.status(401).json({ error: 'Invalid or expired token' });
		}

		res.json({
			success: true,
			data: {
				username: user.username,
				role: user.role,
				id: user.id,
			},
		});
	} catch (err) {
		console.error('JWT verification error:', err);
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

function generateTempPassword() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
	let password = '';
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

async function changePassword(req, res) {
	const { userId, currentPassword, newPassword } = req.body;

	if (!currentPassword || !newPassword) {
		return res.status(400).json({ message: 'All fields are required' });
	}

	const user = await userModel.findById(userId);

	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	// Verify current password
	if (user.password !== md5(currentPassword)) {
		return res.status(400).json({ message: 'Current password is incorrect' });
	}

	// Prevent same password
	if (md5(newPassword) === user.password) {
		return res.status(400).json({ message: 'New password must be different from current' });
	}

	// Save new password
	user.password = md5(newPassword);
	await user.save();

	return res.status(200).json({ success: true, message: 'Password updated successfully' });
}

module.exports = {
	login,
	register,
	logout,
	forgotPassword,
	verify,
	changePassword,
};

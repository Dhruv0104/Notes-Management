const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

function authMiddleware(role) {
	return async (req, res, next) => {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({ error: 'Authorization token missing or malformed' });
		}

		const token = authHeader.split(' ')[1];
		let user = null;
		try {
			user = jwt.verify(token, process.env.JWT_SECRET);

			if (!user || !user._id) {
				return res.status(401).json({ error: 'Invalid or expired token' });
			}
			const userEntry = await userModel.findById(user._id);
			if (!userEntry) {
				return res.status(401).json({ message: 'Invalid session' });
			}

			res.locals.user = userEntry;

			next();
		} catch (err) {
			return res.status(401).json({ error: 'Invalid or expired token' });
		}
	};
}

module.exports = { authMiddleware };

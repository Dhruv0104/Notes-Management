const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

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

			if (!user || !user.id) {
				return res.status(401).json({ error: 'Invalid or expired token' });
			}
			const userEntry = await prisma.user.findUnique({
				where: { id: user.id },
			});
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

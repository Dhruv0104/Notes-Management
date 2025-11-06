require('dotenv').config();
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// const { dbConnect } = require('./utils/db.utils');
const prisma = require('./utils/prisma');
const { errorHandler, asyncRouteHandler } = require('./utils/route.utils');

// include routes here
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');

const app = express();

app.use(cors({ maxAge: 3600 }));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: false,
	})
);

//Routes
app.get('/', (req, res) => {
	res.json({ message: 'Welcome to the server!' });
});
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.use(errorHandler);

async function startServer() {
	try {
		await prisma.$connect(); // ✅ Connect PostgreSQL
		console.log('✅ Connected to PostgreSQL via Prisma');

		app.listen(process.env.PORT, () => {
			console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
		});
	} catch (error) {
		console.error('❌ Database connection failed:', error);
		process.exit(1);
	}
}

startServer();

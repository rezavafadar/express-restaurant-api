const User = require('../model/user');
const Restaurant = require('../model/restaurant');
const { verifyToken } = require('../utils/jwt');

const protect =(...access) => async (req, res, next) => {
		let token;
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		)
			token = req.headers.authorization.split(' ')[1];
		else
			return res.status(400).json({
				message: 'You are not logged in! Please log in to get access.',
			});

		const decoded = await verifyToken(token);
		if (!decoded)
			return res
				.status(400)
				.json({ message: 'Bad request! Token is not valid' });

		if (!access.includes(decoded.role))
			return res
				.status(400)
				.json({ message: 'you not access to this routes' });

		let data;
		if (decoded.role == 'user' || decoded.role == 'superAdmin')
			data = await User.findOne({
				_id: decoded.id,
				role: decoded.role,
			});
		else data = await Restaurant.findById(decoded.id);

		if (!data)
			return res.status(401).json({
				message: 'The user belonging to this token does no longer exist',
			});

		// This feature is not implemented for restaurant account
		if (
			['user', 'superAdmin'].includes(data.role) &&
			data.changedPasswordAfter(decoded.iat)
		) {
			return res.status(401).json({
				message: 'User recently changed password! Please log in again',
			});
		}

		req.data = data;
		next();
	};

module.exports = protect;

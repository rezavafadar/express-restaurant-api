const bcrypt = require('bcrypt');

const User = require('../model/user');
const sendEmail = require('../utils/email');
const { signToken, verifyToken } = require('../utils/jwt');

const protect =
	(...access) =>
	async (req, res, next) => {
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

		let data = await User.findOne({
			_id: decoded.id,
			role: decoded.role,
		});

		if (!data)
			return res.status(401).json({
				message: 'The user belonging to this token does no longer exist',
			});

		if (data.changedPasswordAfter(decoded.iat)) {
			return res.status(401).json({
				message: 'User recently changed password! Please log in again',
			});
		}

		req.data = data;
		next();
	};

const register = async (req, res) => {
	try {
		await User.validateBody(req.body);
	} catch (err) {
		return res.status(400).json({
			message: 'Bad Request! Validation faild',
			errors: errors,
		});
	}

	// create user
	const currentUser = await User.findOne({ email: req.body.email });
	if (currentUser)
		return res
			.status(400)
			.json({ message: 'A user is available with this email' });

	const password = await bcrypt.hash(req.body.password, 9);

	let user = {
		fullname: req.body.fullname,
		email: req.body.email,
		password: password,
	};

	await User.create(user);

	// send wlc email to user
	sendEmail(user.email, 'welcome', `${user.fullname} welcome to restaurant`);

	return res.status(201).json({ message: 'User created !' });
};

const login = async (req, res) => {
	const { email, password } = req.body;

	if (email && password) {
		const user = await User.findOne({ email });

		if (!user)
			return res.status(404).json({ message: 'User is not defined!' });

		const passMatch = await bcrypt.compare(password, user.password);

		if (!passMatch)
			return res.status(401).json({ message: 'Unauthorized' });

		const token = signToken({ id: user._id, role: user.role });

		user.password = null;

		res.status(200).json({ status: 'success', token, data: user });
	} else {
		return res
			.status(400)
			.json({ message: 'Bad Request ! Email or password is wrong' });
	}
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;
	if (!email)
		return res
			.status(400)
			.json({ message: 'Bad Request! email is required' });

	const user = await User.findOne({ email });

	if (!user) return res.status(404).json({ message: 'User is not defined' });

	const token = signToken({ id: user._id, resetPass: true });

	user.passwordResetToken = token;

	user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	await user.save();

	const url = `http://localhost:3000/api/user/resetpassword/${token}`;

	// send reset password link to user
	await sendEmail(
		user.email,
		'reset password',
		`reset password Link: ${url}`
	);

	res.status(200).json({ message: 'successful! Token sent to email!' });
};

const resetPassword = async (req, res) => {
	const resetToken = req.params.token;

	console.log(resetToken);
	let token = await verifyToken(resetToken);

	if (!token)
		return res
			.status(400)
			.json({ message: 'Bad Request ! Token is not valid' });

	if (token.id && token.resetPass) {
		if (!req.body.password)
			return res
				.status(400)
				.json({ message: 'new password is required!' });

		const user = await User.findOne({
			passwordResetToken: resetToken,
			passwordResetExpires: { $gt: Date.now() },
		});

		if (!user)
			return res
				.status(401)
				.json({ message: 'Token is invalid or has expired' });

		user.password = req.body.password;

		user.passwordResetToken = null;

		user.passwordResetExpires = null;

		user.passwordChangedAt = Date.now();

		await user.save();

		res.status(200).json({ message: 'Reset password the successful!' });
	} else
		return res
			.status(401)
			.json({ message: 'Bad Request ! Token is not valid' });
};

module.exports = {
	protect,
	register,
	login,
	forgotPassword,
	resetPassword,
};

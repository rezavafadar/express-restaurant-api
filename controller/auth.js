const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../model/user');
const Restaurant = require('../model/restaurant');
const { signToken, verifyToken } = require('../utils/jwt');
const sendEmail = require('../utils/email');

const createSendToken = (user, statusCode, req, res) => {
	const token = signToken({ id: user._id });

	user.password = null;

	res.status(statusCode).json({ status: 'success', token, data: user });
};

exports.registerHandler = async (req, res) => {
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

	const password = await bcrypt.hash(req.body.password, 10);
	let user = {
		fullname: req.body.fullname,
		email: req.body.email,
		password,
	};

	await User.create(user);

	res.status(201).json({ message: 'User created !' });
	sendEmail(user.email,'welcome',`${user.fullname} welcome to restaurant`)
};

exports.loginHandler = async (req, res) => {
	const { email, password } = req.body;

	if (email && password) {
		const user = await User.findOne({ email });
		if (!user)
			return res.status(404).json({ message: 'User is not defined!' });
		console.log([password]);
		console.log([user.password]);
		const passMatch = await bcrypt.compare(password, user.password);

		console.log(passMatch);
		if (!passMatch)
			return res.status(401).json({ message: 'Unauthorized' });

		createSendToken(user, 200, req, res);
	} else {
		return res
			.status(400)
			.json({ message: 'Bad Request ! Email or password is wrong' });
	}
};

exports.forgetPassword = async (req, res) => {
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
	await sendEmail(user.email,'reset password',`reset password Link: ${url}`)
	res.status(200).json({ message: 'successful! Token sent to email!'});
};

exports.resetPassword = async (req, res) => {
	const { id } = req.params;

	let token = await verifyToken(id);
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
			passwordResetToken: id,
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
		res.status(200).json({ message: 'successfull!' });
	} else
		return res
			.status(401)
			.json({ message: 'Bad Request ! Token is not valid' });
};

exports.protect = async (req, res, next) => {
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

	const currentUser = await User.findById(decoded.id);

	if (!currentUser)
		return res.status(401).json({
			message: 'The user belonging to this token does no longer exist',
		});

	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return res.status(401).json({
			message: 'User recently changed password! Please log in again',
		});
	}

	req.user = currentUser;
	next();
};

exports.isCurrentAdmin = async(req,res,next)=>{
	if(req.user.role == 'user') return res.status(401).json({'message':'Bad request! you do not have permission to perform this action'})
	
	const {id} = req.params

	if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'Bad request! your restaurant id is not valid'})

	const currentRestaurant = await Restaurant.findById(id)

	if(!currentRestaurant) return res.status(404).json({message:'Restaurant is not defined!'})
	if(currentRestaurant.admin != req.user._id) return res.status(401).json({message:'you not restaurant admin'})

	next()
}
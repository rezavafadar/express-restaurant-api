const uuid = require('uuid').v4;
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const path = require('path');
const fs = require('fs');

const User = require('../model/user');
const Food = require('../model/food');
const Restaurant = require('../model/restaurant');

const filtredObj = require('../utils/filteredObj');
const sendEmail = require('../utils/email');
const { signToken, verifyToken } = require('../utils/jwt');

const createSendToken = (user, statusCode, req, res) => {
	const token = signToken({ id: user._id });

	user.password = null;

	res.status(statusCode).json({ status: 'success', token, data: user });
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
	console.log('register hashPass:', password);
	let user = {
		fullname: req.body.fullname,
		email: req.body.email,
		password: password,
	};

	await User.create(user);

	res.status(201).json({ message: 'User created !' });
	sendEmail(user.email, 'welcome', `${user.fullname} welcome to restaurant`);
};

const login = async (req, res) => {
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

const forgetPassword = async (req, res) => {
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
	await sendEmail(
		user.email,
		'reset password',
		`reset password Link: ${url}`
	);
	res.status(200).json({ message: 'successful! Token sent to email!' });
};

const resetPassword = async (req, res) => {
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

const getUser = async (req, res) => {
	const {
		fullname = '',
		email = '',
		createAt = '',
		role = '',
		active = '',
		photo = '',
		passwordChangedAt,
	} = await User.findById(
		req.data.role == 'superAdmin' ? req.params.id : req.data._id
	);
	if (fullname === '')
		return res.status(404).json({ message: 'User is not defined!' });

	res.status(200).json({
		message: 'Find user is successfull!',
		data: {
			fullname,
			email,
			createAt,
			role,
			active,
			photo,
			passwordChangedAt,
		},
	});
};

const uploadProfileImg = async (req, res, next) => {
	if (!req.files) return next();

	const img = req.files ? req.files.profileImg : {};

	const fileName = `${uuid()}_${img.name}`;
	const uploadPath = path.join(
		__dirname,
		'..',
		'public',
		'uploadImgs',
		fileName
	);

	sharp(img.data)
		.toFormat('jpeg')
		.jpeg({ quality: 60 })
		.toFile(uploadPath)
		.catch((err) => console.log(err));

	req.profileImg = fileName;
	next();
};

const updateMe = async (req, res) => {
	const body = req.body;

	if (body.password || body.role)
		return res.status(400).json({
			message: 'Bad Request ! The request contains sensitive information',
		});

	const obj = filtredObj(body, 'fullname', 'email');

	if (req.profileImg) obj.photo = req.profileImg;

	const user = await User.findByIdAndUpdate(
		req.data.role == 'superAdmin' ? req.params.id : req.data._id,
		obj
	);

	if (!user) return res.status(404).json({ message: 'user is not defined' });

	if (user.photo != 'default.jpeg') {
		const deletePath = path.join(
			__dirname,
			'..',
			'public',
			'uploadImgs',
			user.photo
		);
		fs.unlink(deletePath, (err) => {
			if (err) console.log('delete img error', err);
		});
	}

	res.status(200).json({ message: 'Edit is successfull!' });
};

const deleteUser = async (req, res) => {
	await User.findByIdAndUpdate(
		req.data.role == 'superAdmin' ? req.params.id : req.data._id,
		{ active: false }
	);

	res.status(200).json({ status: 'success' });
};

const getAllUser = async (req, res) => {
	const { id } = req.params;

	const users = await User.find({})
		.skip((id - 1) * 10)
		.exec(10);

	res.status(200).json({ message: 'successfull!', data: users });
};

const updateBasket = async (req, res) => {
	if (!req.body.id || !req.body.number)
		return res
			.status(400)
			.json({ message: 'Bad request! id or number is wrong' });
	if (!mongoose.Types.ObjectId.isValid(req.body.id))
		return res.status(400).json({ message: 'food id is not valid' });
	const food = {
		id: req.body.id,
		number: req.body.number,
	};

	const currentFood = await Food.findById(food.id);
	if (!currentFood)
		return res.status(404).json({ message: 'food is not defined' });

	const user = await User.findById(req.data._id);

	// Check the basket and the correctness of the restaurant with food
	if (
		req.data.basket &&
		req.data.basket.restaurantId == currentFood.restaurant.id
	) {
		// check for food
		const findIndex = user.basket.foods.findIndex((i) => i.id == food.id);
		if (findIndex >= 0) {
			user.basket.foods[findIndex].number =
				user.basket.foods[findIndex].number + food.number;
		} else {
			user.basket.foods.push({
				name: currentFood.name,
				id: currentFood._id,
				price: currentFood.price,
				number: food.number,
			});
		}
		await user.save();
	} else {
		const basket = {
			restaurantName: currentFood.restaurant.name,
			restaurantId: currentFood.restaurant.id,
			foods: [
				{
					name: currentFood.name,
					id: currentFood._id,
					price: currentFood.price,
					number: food.number,
				},
			],
		};
		user.basket = basket;
		await user.save();
	}

	res.status(200).json({ message: 'successfull' });
};

const resetBasket = async (req,res) =>{
	const currentBasket = req.data.basket
	
	if(!currentBasket) return res.status(400).json({message:'basket is empty'})

	await User.findByIdAndUpdate(req.data._id,{basket:null})

	res.status(200).json({message:'successfull!'})
}

const getBasket = async (req, res) => {
	res.status(200).json({message:'successfull!',data:req.data.basket})
};

module.exports = {
	getUser,
	uploadProfileImg,
	updateMe,
	deleteUser,
	getAllUser,
	register,
	login,
	resetPassword,
	forgetPassword,
	updateBasket,
	resetBasket,
	getBasket
};


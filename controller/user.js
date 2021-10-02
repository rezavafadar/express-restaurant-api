const uuid = require('uuid').v4;
const sharp = require('sharp');
const mongoose = require('mongoose');

const path = require('path');
const fs = require('fs');

const User = require('../model/user');
const Food = require('../model/food');

const filtredObj = require('../utils/filteredObj');

const getUser = async (req, res) => {
	const id = req.data.role == 'superAdmin' ? req.params.id : req.data._id

	const {
		fullname = '',
		email = '',
		createAt = '',
		role = '',
		active = '',
		photo = '',
		passwordChangedAt,
	} = await User.findById(id);

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

const uploadProfileImg = (req, res, next) => {
	if (!req.files || req.files.profileImg) return next();

	const img = req.files.profileImg;

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

	const data = filtredObj(body, 'fullname', 'email');

	if (req.profileImg) data.photo = req.profileImg;

	const id = req.data.role == 'superAdmin' ? req.params.id : req.data._id

	const user = await User.findByIdAndUpdate(id,data);

	if (!user) return res.status(404).json({ message: 'User is not defined' });

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
	const id = req.data.role == 'superAdmin' ? req.params.id : req.data._id 
	await User.findByIdAndUpdate(id,{ active: false }
	);

	res.status(200).json({ status: 'Delete user the success' });
};

const getAllUser = async (req, res) => {
	const { id } = req.params;

	const users = await User.find({})
		.skip((id - 1) * 10)
		.exec(10);

	res.status(200).json({ message: 'Successfull!', data: users });
};

const updateBasket = async (req, res) => {
	if (!req.body.id || !req.body.number)
		return res
			.status(400)
			.json({ message: 'Bad request! Food id or number is wrong' });

	if (!mongoose.Types.ObjectId.isValid(req.body.id)) return res.status(400).json({ message: 'Food id is not valid' });

	const food = {
		id: req.body.id,
		number: req.body.number,
	};

	const currentFood = await Food.findById(food.id);

	if (!currentFood)
		return res.status(404).json({ message: 'Food is not defined' });

	const user = await User.findById(req.data._id);

	// Check the basket and the correctness of the restaurant with food
	if (
		req.data.basket &&
		req.data.basket.restaurantId == currentFood.restaurant.id
	) {
		// Check for food
		const findIndex = user.basket.foods.findIndex((i) => i.id == food.id);

		if (findIndex >= 0) {
			user.basket.foods[findIndex].number = user.basket.foods[findIndex].number + food.number;
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

	res.status(200).json({ message: 'Successfull' });
};

const resetBasket = async (req, res) => {
	const currentBasket = req.data.basket;

	if (!currentBasket)
		return res.status(400).json({ message: 'Basket is empty' });

	await User.findByIdAndUpdate(req.data._id, { basket: null });

	res.status(200).json({ message: 'successfull!' });
};

const getBasket = async (req, res) => {
	res.status(200).json({ message: 'Successfull!', data: req.data.basket });
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
	getBasket,
};

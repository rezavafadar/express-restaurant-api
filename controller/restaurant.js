const uuid = require('uuid').v4;
const sharp = require('sharp');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const path = require('path');
const fs = require('fs');

const Restaurant = require('../model/restaurant');
const Food = require('../model/food');
const filtredObj = require('../utils/filteredObj');
const { signToken, verifyToken } = require('../utils/jwt');

const register = async (req, res) => {
	try {
		await Restaurant.validateBody(req.body);
	} catch (error) {
		return res.status(400).json({
			message: 'Bad request! Validation faild',
			errors: error.errors,
		});
	}

	const password = await bcrypt.hash(req.body.password, 10);

	const data = {
		name: req.body.name,
		description: req.body.description,
		address: req.body.address,
		phone: req.body.phone,
		adminUsername: req.body.username,
		adminPassword: password,
	};

	if (req.restaurantProfileImg) data.photo = req.restaurantProfileImg;

	const currentRestaurant = await Restaurant.findOne({
		$or: [
			{
				name: data.name,
				address: data.address,
			},
			{ address: data.address },
			{ adminUsername: data.adminUsername },
		],
	});

	if (currentRestaurant)
		return res.status(400).json({
			message: 'There is a restaurant with this information',
		});

	await Restaurant.create(data);
	res.status(201).json({ message: 'Restaurant created!' });
};

const login = async (req, res) => {
	const { username, password } = req.body;

	if (username && password) {
		const currentRestaurant = await Restaurant.findOne({
			adminUsername: username,
		});

	if (!currentRestaurant)
		return res
			.status(404)
			.json({ message: 'Restaurant is not defined' });

	const passIsMatch = await bcrypt.compare(
		password,
		currentRestaurant.adminPassword
	);

	if (!passIsMatch)
		return res.status(400).json({
			message: 'Bad request! Username or password is wrong',
		});

		const token = signToken({
			id: currentRestaurant._id,
			role: 'restaurant',
		});

		res.status(200).json({ message: 'successfull!', token });
	} else {
		return res
			.status(400)
			.json({ message: 'Bad request! Username or password is wrong' });
	}
};

const getRestaurant = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id))
		return res.status(400).json({
			message: 'Bad request! Restaurant id is not valid',
		});

	const {
		name,
		description,
		photo,
		phone,
		address,
		score,
		active,
		adminUsername,
		createAt,
	} = await Restaurant.findById(id);

	if (!name || active == false)
		return res
			.status(404)
			.json({ message: 'Restaurant is not defined', data: null });

	res.status(200).json({
		message: 'Find restaurant is successfull!',
		data: {
			name,
			description,
			photo,
			phone,
			address,
			score,
			adminUsername,
			createAt,
		},
	});
};

const uploadImg = async (req, res, next) => {
	if (!req.files || !req.files.profileImg) return next();

	const img = req.files.profileImg;
	const fileName = `${uuid()}_${img.name}`;
	const uploadPath = path.join(
		__dirname,
		'..',
		'public',
		'restaurantProfile',
		fileName
	);

	sharp(img.data)
		.toFormat('jpeg')
		.jpeg({ quality: 60 })
		.toFile(uploadPath)
		.catch((err) => console.log(err));

	req.restaurantProfileImg = fileName;
	next();
};

const editRestaurant = async (req, res) => {
	if (req.body.admin || req.body.active)
		return res.status(400).json({
			message: 'Bad Request ! The request contains sensitive information',
		});

	const obj = filtredObj(
		req.body,
		'name',
		'phone',
		'description',
		'address'
	);

	if (req.restaurantProfileImg) obj.photo = req.restaurantProfileImg;

	if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id))
		return res.status(400).json({
			message: 'Bad request! your restaurant id is not valid',
		});

	const id = req.data.role == 'superAdmin' ? req.params.id : req.data._id

	const restaurant = await Restaurant.findByIdAndUpdate(id,obj);

	if (!restaurant)
		return res.status(404).json({ message: 'restaurant is not defined' });

	if (restaurant.photo != 'default.jpeg') {
		const deletePath = path.join(
			__dirname,
			'..',
			'public',
			'restaurantProfile',
			restaurant.photo
		);
		fs.unlink(deletePath, (err) => {
			if (err) console.log('delete img error', err);
		});
	}
	res.status(200).json({ message: 'Edit is successfull!' });
};

const deleteRestaurant = async (req, res) => {
	if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id))
		return res.status(400).json({
			message: 'Bad request! your restaurant id is not valid',
		});

		console.log(req.data);
	const id = req.data.role == 'superAdmin'? req.params.id: req.data._id

	await Food.deleteMany({'restaurant.id':id})

	const currentRestaurant = await Restaurant.findOneAndUpdate(
		{
			_id:id,
			active: true,
		},
		{ active: false }
	);

	
	if (!currentRestaurant)
		return res.status(404).json({ message: 'Restaurant is not defined' });

	res.status(200).json({ message: 'Delete restaurant is successfull' });
};

const getAllRestaurant = async (req, res) => {
	const { id } = req.params;

	const restaurants = await Restaurant.find({})
		.skip((id - 1) * 10)
		.limit(10);

	res.status(200).json({ message: 'Successfull!', data: restaurants });
};

module.exports = {
	register,
	login,
	getAllRestaurant,
	deleteRestaurant,
	uploadImg,
	editRestaurant,
	getRestaurant,
};

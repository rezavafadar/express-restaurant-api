const uuid = require('uuid').v4;
const sharp = require('sharp');
const mongoose = require('mongoose');

const path = require('path');
const fs = require('fs');

const Restaurant = require('../model/restaurant');
const Food = require('../model/food');
const filtredObj = require('../utils/filteredObj');

const register = async (req, res) => {
	try {
		await Restaurant.validateBody(req.body);
	} catch (error) {
		return res.status(400).json({
			message: 'Bad request! Validation faild',
			errors: error.errors,
		});
	}


	const data = {
		name: req.body.name,
		description: req.body.description,
		address: req.body.address,
		phone: req.body.phone,
		admin: req.data.email
	};

	if (req.restaurantProfileImg) data.photo = req.restaurantProfileImg;

	const currentRestaurant = await Restaurant.findOne({
		$or: [
			{
				name: data.name,
				address: data.address,
			},
			{ address: data.address },
			{ admin: data.admin },
		],
	});

	if (currentRestaurant)
		return res.status(400).json({
			message: 'There is a restaurant with this information',
		});

	await Restaurant.create(data);
	res.status(201).json({ message: 'Restaurant created!' });
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

	const {id} = req.params

	if (!id || !mongoose.Types.ObjectId.isValid(req.params.id))
		return res.status(400).json({
			message: 'Bad request! your restaurant id is not valid',
		});


	const restaurant = await Restaurant.findOneAndUpdate({_id:id,admin:req.data.email},obj);

	if (!restaurant)
		return res.status(404).json({ message: 'No restaurants with these specifications were found for you' });

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
	const {id} = req.params
	if (!id || !mongoose.Types.ObjectId.isValid(id))
		return res.status(400).json({
			message: 'Bad request! your restaurant id is not valid',
		});

	
	const currentRestaurant = await Restaurant.findOneAndUpdate(
		{
			_id:id,
			admin:req.data.email,
			active: true,
		},
		{ active: false }
	);

	
	if (!currentRestaurant)
		return res.status(404).json({ message: 'No restaurants with these specifications were found for you' });


	await Food.deleteMany({'restaurant.id':currentRestaurant._id})

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
	getAllRestaurant,
	deleteRestaurant,
	uploadImg,
	editRestaurant,
	getRestaurant,
};

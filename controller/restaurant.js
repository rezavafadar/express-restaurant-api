const uuid = require('uuid').v4;
const sharp = require('sharp');
const mongoose = require('mongoose');

const path = require('path');

const Restaurant = require('../model/restaurant');
const filtredObj = require('../utils/filteredObj');

const addRestaurant = async (req, res) => {
	if(req.user.role == 'user') return res.status(401).json({'message':'Bad request! you do not have permission to perform this action'})
	try {
		await Restaurant.validateBody(req.body);
	} catch (error) {
		return res
			.status(400)
			.json({ message: 'Bad request! Validation faild', error });
	}

	const data = {
		name: req.body.name,
		bio: req.body.bio,
		address: req.body.address,
		phone: req.body.phone,
		admin:req.user.id
	};

	const currentRestaurant = await Restaurant.findOne({
		$or: [
			{
				name: data.name,
				address: data.address,
			},
			{ address: data.address },
		],
	});

	if (currentRestaurant)
		return res
			.status(400)
			.json({
				message: 'There is a restaurant with this name and address',
			});

	await Restaurant.create(data);
	res.status(201).json({ message: 'Restaurant created!' });
};

const getRestaurant = async (req, res) => {
	const { id } = req.params;
	console.log(mongoose.Types.ObjectId.isValid(id));
	if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'Bad request! your restaurant id is not valid'})

	const currentRestaurant = await Restaurant.findById(id);

	if (!currentRestaurant)
		return res
			.status(404)
			.json({ message: 'Restaurant is not defined', data: null });

	res.status(200).json({
		message: 'find restaurant is successfull!',
		data: currentRestaurant,
	});
};

const uploadImg = async (req,res,next) =>{
    if(!req.files || !req.files.profileImg) return next()

    const img = req.files.profileImg
    const fileName = `${uuid()}_${img.name}`
    const uploadPath = path.join(__dirname,'..','public','restaurantProfile',fileName)

    sharp(img.data)
    .toFormat('jpeg')
    .jpeg({quality:60})
    .toFile(uploadPath)
    .catch(err => console.log(err))

    req.restaurantProfileImg = fileName
    next()
}

const editRestaurant = async (req, res) => {
	const { id } = req.params;
	if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'Bad request! your restaurant id is not valid'})

	if (req.body.admin || req.body.active) return res.status(400).json({
			message: 'Bad Request ! The request contains sensitive information',
		});

	const obj = filtredObj(req.body, 'name', 'phone', 'bio', 'address');
    if(req.restaurantProfileImg) obj.photo = req.restaurantProfileImg

	const findObj = {
		_id:id
	}
	if(req.user.role !== 'superAdmin') findObj.admin =req.user.id
	const restaurant = await Restaurant.findOneAndUpdate(findObj, obj);

    if(!restaurant) return res.status(404).json({'message':'restaurant is not defined'})

    res.status(200).json({'message':'Edit is successfull!'})
};

const deleteRestaurant = async (req, res) => {
	const { id } = req.params;
	if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'Bad request! your restaurant id is not valid'})
	const findObj = {
		_id:id,
		active:true
	}
	if(req.user.role !== 'superAdmin') findObj.admin =req.user.id
	const currentRestaurant = await Restaurant.findOneAndUpdate(
		findObj,
		{ active: false }
	);

	if (!currentRestaurant)
		return res.status(404).json({ message: 'restaurant is not defined or you not restaurant admin' });
	res.status(200).json({ message: 'Delete restaurant is successfull' });
};

const getAllRestaurant = async (req,res)=>{
    const {id} = req.params

    const restaurants = await Restaurant.find({}).skip((id-1)*10).limit(10)

    res.status(200).json({'message':'successfull!',data:restaurants})
}



module.exports={
	getAllRestaurant,
	deleteRestaurant,
	uploadImg,
	editRestaurant,
	getRestaurant,
	addRestaurant
}
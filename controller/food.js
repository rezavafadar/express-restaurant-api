const mongoose = require('mongoose');
const uuid = require('uuid').v4;
const sharp = require('sharp');

const path = require('path');

const Food = require('../model/food');
const Restaurant = require('../model/restaurant');
const filtredObj = require('../utils/filteredObj');

exports.addFood = async (req,res)=>{
    try {
        await Food.validateBody(req.body)
    } catch (error) {
        return res.status(400).json({'message':'Bad request! validation error',error:error.errors})
    }

    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'restaurant id is not valid'})

    const currentRestaurant = await Restaurant.findOne({_id:id,admin:req.user.id})
    if(!currentRestaurant) return res.status(404).json({'message':'restaurant is not defined or you not restaurant admin'})

    const currentFood = await Food.findOne({name:req.body.name,'restaurant.id':currentRestaurant._id,'restaurant.name':currentRestaurant.name})
    if(currentFood) return res.status(400).json({'message':'This food is available in the restaurant'})


    const food = {
        name:req.body.name,
        price:req.body.price,
        bio:req.body.bio,
        restaurant:{
            name:currentRestaurant.name,
            id:currentRestaurant._id
        }
    }
    
    await Food.create(food)
    res.status(201).json({'message':'food is created!'})
}

exports.uploadFoodImg = async (req,res,next)=>{
    if(!req.files) return next()

    const img = req.files.foodImg

    const fileName = `${uuid()}_${img.name}`
    const uploadPath = path.join(__dirname,"..","public","foodImgs",fileName)

    sharp(img.data)
    .toFormat('jpeg')
    .jpeg({quality:60})
    .toFile(uploadPath)
    .catch(err=> console.log(err))

    req.foodImg = fileName
    next()
}

exports.editFood = async (req,res)=>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'Bad request! your restaurant id is not valid'})

    if(req.body.restaurant || req.body.score) return res.status(400).json({'message':'Bad Request ! The request contains sensitive information'})

    const update = filtredObj(req.body,'name','price','bio')
    if(req.foodImg) update.photo = req.foodImg

    const food = await Food.findByIdAndUpdate(id,update)

    if(!food) return res.status(404).json({'message':'food is not defined'})

    res.status(200).json({'message':'successfull!'})
}
exports.deleteFood = async (req,res) =>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'food id is not valid'})

    const food = await Food.findById(id)
    if(!food) return res.status(404).json({'message':'food is not defined!'})

    const currentRestaurant= await Restaurant.findOne({_id:food.restaurant.id,admin:req.user._id})

    if(currentRestaurant.admin != req.user._id) return res.status(404).json({'message':'you not restaurant admin!'})

    await food.remove()

    res.status(200).json({'message':'successfull!'})
}

exports.getFood = async (req,res) =>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'food id is not valid'})

    const food = await Food.findById(id)
    if(!food) return res.status(404).json({'message':'food is not defined',data:null})

    res.status(200).json({'message':'successfull!',data:food})
}

exports.getAllFoods = async (req,res) =>{
    const {id} = req.params

    const foods = await Food.find({}).skip((id-1)*10).exec(10)

    res.status(200).json({'message':'successfull!',data:foods})
}
const mongoose = require('mongoose');
const uuid = require('uuid').v4;
const sharp = require('sharp');

const path = require('path');
const fs= require('fs');

const Food = require('../model/food');
const Restaurant = require('../model/restaurant');
const filtredObj = require('../utils/filteredObj');

const addFood = async (req,res)=>{
    try {
        await Food.validateBody(req.body)
    } catch (error) {
        return res.status(400).json({'message':'Bad request! validation error',error:error.errors})
    }

    if(!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({'message':'Bad request! food id is not valid'})

    const currentRestaurant = await Restaurant.findById({_id:req.data.role == 'superAdmin'?req.params.id:req.data._id})

    if(!currentRestaurant) return res.status(404).json({'message':'restaurant is not defined'})

    const currentFood = await Food.findOne({name:req.body.name,'restaurant.id':req.data.role == 'superAdmin'?req.params.id:req.data._id})
    if(currentFood) return res.status(400).json({'message':'This food is available in the restaurant'})


    const food = {
        name:req.body.name,
        price:req.body.price,
        description:req.body.description,
        restaurant:{
            name:currentRestaurant.name,
            id:currentRestaurant._id
        }
    }
    
    await Food.create(food)
    res.status(201).json({'message':'food is created!'})
}

const uploadFoodImg = async (req,res,next)=>{
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

const editFood = async (req,res)=>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'Bad request! your restaurant id is not valid'})

    if(req.body.restaurant || req.body.score) return res.status(400).json({'message':'Bad Request ! The request contains sensitive information'})

    const update = filtredObj(req.body,'name','price','description')
    if(req.foodImg) update.photo = req.foodImg

    const findObj = {
        _id:id,
    }
    if(req.data.role != 'superAdmin') findObj['restaurant.id']=req.data._id
    const food = await Food.findOneAndUpdate(findObj,update)
    if(!food) return res.status(404).json({'message':'food is not defined'})

    if(food.photo != 'default.jpeg'){
        const deletePath = path.join(__dirname,"..","public","foodImgs",food.photo)
        fs.unlink(deletePath,(err) =>{
            if(err)console.log('delete img error',err)
        })
    }

    res.status(200).json({'message':'successfull!'})
}

const deleteFood = async (req,res) =>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'food id is not valid'})

    const findObj = {
        _id:id,
    }

    if(req.data.role != 'superAdmin') findObj['restaurant.id']=req.data._id

    const food = await Food.findOneAndDelete(findObj)
    if(!food) return res.status(404).json({'message':'food is not defined!'})

    res.status(200).json({'message':'successfull!'})
}

const getFood = async (req,res) =>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'food id is not valid'})

    const food = await Food.findById(id)
    if(!food) return res.status(404).json({'message':'food is not defined',data:null})

    res.status(200).json({'message':'successfull!',data:food})
}

const getAllFoods = async (req,res) =>{
    const {id} = req.params

    const foods = await Food.find({}).skip((id-1)*10).exec(10)

    res.status(200).json({'message':'successfull!',data:foods})
}

module.exports={
    addFood,
    uploadFoodImg,
    editFood,
    deleteFood,
    getAllFoods,
    getFood
}
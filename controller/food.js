const mongoose = require('mongoose');
const Food = require('../model/food');
const Restaurant = require('../model/restaurant');

exports.addFood = async (req,res)=>{
    try {
        await Food.validateBody(req.body)
    } catch (error) {
        return res.status(400).json({'message':'Bad request! validation error',error})
    }

    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({'message':'restaurant id is not valid'})

    const currentRestaurant = await Restaurant.findOne({_id:id,admin:req.user.id})
    if(!currentRestaurant) return res.status(404).json({'message':'restaurant is not defined or you not restaurant admin'})

    // schema
    // {
    //     name:'test',
    //     restaurant:{
    //         name:'testing',
    //         id:'test id'
    //     },
    //     bio:'test bio'
    // }
    // find
    console.log(currentRestaurant);
    const currentFood = await Food.findOne({name:req.body.name,restaurant:{id:currentRestaurant._id,name:currentRestaurant.name}})
    console.log(currentFood);
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
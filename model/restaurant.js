const mongoose = require('mongoose');

const validation = require('./secure/restaurant');

const restaurantSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    adminUsername:{type:String,required:true},
    adminPassword:{type:String,required:true},
    score:{type:Number,default:0},
    photo:{type:String,default:'restaurant.jpeg'},
    phone:{type:Number,required:true},
    address:{type:String,required:true},
    active:{type:Boolean,default:true},
    createAt:{
        type:Date,
        default:Date.now()
    }
})

restaurantSchema.statics.validateBody = function(body){
    return validation.validate(body,{abortEarly:false})
}

module.exports = mongoose.model('restaurants',restaurantSchema)
const mongoose = require('mongoose');

const validation = require('./secure/food');

const foodSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        default:'food.jpeg'
    },
    restaurant:{
        name:{
            type:String,
            required:true,
        },
        id:{
            type:String,
            required:true
        }
    },
    score:{
        type:Number,
        default:0
    },
    description:{
        type:String,
        required:true
    }
})

foodSchema.statics.validateBody = function(body){
    return validation.validate(body,{abortEarly:false})
}

module.exports= mongoose.model('foods',foodSchema)
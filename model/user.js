const mongoose = require('mongoose');

const {validateSchema} = require('./secure/user');

const userSchema = mongoose.Schema({
    fullname:{
        type:String,
        required:[true,'fullname is required']
    },
    email:{
        type:String,
        required:[true,'email is required']
    },
    password:{
        type:String,
        required:[true,'password is required']
    },
    role:{
        type:String,
        enum:['user','subAdmin','superAdmin'],
        default:'user'
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    active:{
        type:Boolean,
        default:true
    },
    passwordChangedAt:Date,
    passwordResetAt:Date,
    createAt:{
        type:Date,
        default:Date.now()
    }
})

userSchema.statics.validateBody = function(body){
    return validateSchema.validate(body,{abortEarly:false})
}

module.exports = mongoose.model('users',userSchema)
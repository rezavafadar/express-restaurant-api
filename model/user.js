const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    passwordResetToken:String,
    passwordResetExpires:Date,
    createAt:{
        type:Date,
        default:Date.now()
    }
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.statics.validateBody = function(body){
    return validateSchema.validate(body,{abortEarly:false})
}

userSchema.methods.changedPasswordAfter= function(jwtTime){
    const passwordChangedTime = this.passwordChangedAt
    if(passwordChangedTime){
        const changeTime = parseInt(passwordChangedTime.getTime() /1000,10)

        return jwtTime < changeTime
    }

    return false

}
module.exports = mongoose.model('users',userSchema)
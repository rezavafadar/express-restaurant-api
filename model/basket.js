const mongoose = require('mongoose');

const basketSchema = mongoose.Schema(
    {
        restaurantName:String,
        restaurantId:String,
        foods:[
            {
                name:String,
                price:Number,
                id:String,
                number:Number
            }
        ]
    }
)

module.exports = basketSchema
const express = require('express');
const morgan = require('morgan');

require('dotenv').config({path:"./config/.env"});

const userRoutes = require('./routes/user');

const app = express()

// connect to db
require('./utils/connectDB')();

// development mode
if(process.env.APPMODE == "development"){
    morgan('dev')
}

// express middleware
app.use(express.urlencoded())
app.use(express.json())
app.use(express.static('public'))

// routes
app.use('/api/user',userRoutes)
// app.use('/api/admin')

let port = process.env.PORT || 3000
app.listen(port,(err) => console.log(`server is runing ${process.env.APPMODE} mode on port ${port}`))
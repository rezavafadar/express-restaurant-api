const express = require('express');
const morgan = require('morgan');

require('dotenv').config({path:"./config/.env"});

const app = express()

if(process.env.APPMODE == "development"){
    morgan('dev')
}

let port = process.env.PORT || 3000
app.listen(port,(err) => console.log(`server is runing ${process.env.APPMODE} mode on port ${port}`))
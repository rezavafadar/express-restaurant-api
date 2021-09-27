const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv')

dotenv.config({path:`./config/${process.env.NODE_ENV}.env`})

const userRoutes = require('./routes/user');

function application() {
	const app = express();
	const appMode =process.env.NODE_ENV
	// development mode
	if ( appMode == 'dev') {
		morgan('dev');
	}

	// express middleware
	app.use(express.urlencoded());
	app.use(express.json());
	app.use(fileUpload());
	app.use(express.static('public'));

	// routes
	app.use('/api/user', userRoutes);
	// app.use('/api/admin')
	return app;
}

module.exports = application

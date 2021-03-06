const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');

dotenv.config({ path: `./config/${process.env.NODE_ENV}.env` });

const userRoutes = require('./routes/user');
const restaurantRoutes = require('./routes/restaurant');
const foodRoutes = require('./routes/food');

function app() {
	const app = express();
	const appMode = process.env.NODE_ENV;
	
	// development mode
	if (appMode == 'dev') {
		morgan('dev');
	}

	// express middleware
	app.use(express.urlencoded());
	app.use(express.json());
	app.use(fileUpload());
	app.use(express.static('public'));

	// routes
	app.use('/api/user', userRoutes);
	app.use('/api/restaurant', restaurantRoutes);
	app.use('/api/food', foodRoutes);

	return app;
}

module.exports = app;

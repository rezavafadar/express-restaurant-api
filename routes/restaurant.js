const router = require('express').Router();

const authController = require('../controller/auth');
const {
	addRestaurant,
	getRestaurant,
	deleteRestaurant,
	editRestaurant,
	uploadImg,
	getAllRestaurant,
} = require('../controller/restaurant');

const errHandler = require('../utils/errhandler');

router.get('/all/:id', errHandler(getAllRestaurant));

router.get('/:id', errHandler(getRestaurant));


router.use(authController.protect);


router.post('/add-restaurant', errHandler(addRestaurant));

router.patch('/:id',errHandler(authController.isCurrentAdmin), errHandler(uploadImg), errHandler(editRestaurant));

router.delete('/:id',errHandler(authController.isCurrentAdmin), errHandler(deleteRestaurant));

module.exports = router;
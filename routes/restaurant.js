const router = require('express').Router();

const {
	register,
	getRestaurant,
	deleteRestaurant,
	editRestaurant,
	uploadImg,
	getAllRestaurant,
	login,
	restaurantAuthenticate
} = require('../controller/restaurant');

const errHandler = require('../utils/errhandler');

router.get('/all/:id', errHandler(getAllRestaurant));

router.get('/:id', errHandler(getRestaurant));

router.post('/add-restaurant', errHandler(register));

router.post('/login',errHandler(login))

router.use(restaurantAuthenticate)

router.route('/')
      .patch(errHandler(uploadImg), errHandler(editRestaurant))
	  .delete(errHandler(deleteRestaurant))

module.exports = router;
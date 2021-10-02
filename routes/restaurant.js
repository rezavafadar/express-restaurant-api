const router = require('express').Router();

const {
	register,
	getRestaurant,
	deleteRestaurant,
	editRestaurant,
	uploadImg,
	getAllRestaurant,
	login
} = require('../controller/restaurant');
const protect = require('../controller/auth');

const errHandler = require('../utils/errhandler');

router.get('/all/:id', errHandler(getAllRestaurant));

router.get('/:id', errHandler(getRestaurant));

router.post('/add-restaurant', errHandler(register));

router.post('/login',errHandler(login))

router.use(protect('superAdmin','restaurant'))

router.route('/:id')
      .patch(errHandler(uploadImg), errHandler(editRestaurant))
	  .delete(errHandler(deleteRestaurant))

module.exports = router;
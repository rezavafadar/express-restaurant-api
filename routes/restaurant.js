const router = require('express').Router();

const {
	register,
	getRestaurant,
	deleteRestaurant,
	editRestaurant,
	uploadImg,
	getAllRestaurant,
} = require('../controller/restaurant');
const {protect} = require('../controller/auth');

const errHandler = require('../utils/errorHandler');

router.get('/all/:id', errHandler(getAllRestaurant));

router.get('/:id', errHandler(getRestaurant));


router.use(protect('superAdmin','user'))

router.post('/add-restaurant',errHandler(uploadImg), errHandler(register));

router.route('/:id')
      .patch(errHandler(uploadImg), errHandler(editRestaurant))
	  .delete(errHandler(deleteRestaurant))

module.exports = router;
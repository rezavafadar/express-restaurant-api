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
router.use(authController.restricTo('admin','superAdmin'));


router.post('/add-restaurant', errHandler(addRestaurant));

router.patch('/:id', errHandler(uploadImg), errHandler(editRestaurant));

router.delete('/:id', errHandler(deleteRestaurant));

module.exports = router;

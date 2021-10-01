const router = require('express').Router();

// const {restricTo,protect} = require('../controller/auth');
const {addFood, getFood, getAllFoods, deleteFood, uploadFoodImg, editFood} = require('../controller/food');
const {restaurantAuthenticate} = require('../controller/restaurant');
const errHandler = require('../utils/errhandler');

router.get('/all/:id',errHandler(getAllFoods))

router.get('/:id',errHandler(getFood))

router.use(errHandler(restaurantAuthenticate))


router.post('/add-food',errHandler(addFood))

router.route('/:id')
      .delete(errHandler(deleteFood))
      .patch(errHandler(uploadFoodImg),errHandler(editFood))

module.exports = router
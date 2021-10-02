const router = require('express').Router();

const protect = require('../controller/auth');
const {addFood, getFood, getAllFoods, deleteFood, uploadFoodImg, editFood} = require('../controller/food');

const errHandler = require('../utils/errhandler');

router.get('/all/:id',errHandler(getAllFoods))

router.get('/:id',errHandler(getFood))

router.use(errHandler(protect('superAdmin','restaurant')))


router.post('/add-food/:id',errHandler(addFood))

router.route('/:id')
      .delete(errHandler(deleteFood))
      .patch(errHandler(uploadFoodImg),errHandler(editFood))

module.exports = router
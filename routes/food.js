const router = require('express').Router();

const {protect} = require('../controller/auth');
const {addFood, getFood, getAllFoods, deleteFood, uploadFoodImg, editFood} = require('../controller/food');

const errHandler = require('../utils/errorHandler');

router.get('/all/:id',errHandler(getAllFoods))

router.get('/:id',errHandler(getFood))

// Authenticate Middleware
router.use(errHandler(protect('superAdmin','user')))

router.route('/:id')
      .post(errHandler(uploadFoodImg),errHandler(addFood))
      .delete(errHandler(deleteFood))
      .patch(errHandler(uploadFoodImg),errHandler(editFood))

module.exports = router
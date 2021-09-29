const router = require('express').Router();

const {restricTo,protect} = require('../controller/auth');
const {addFood, getFood, getAllFoods, deleteFood, uploadFoodImg, editFood} = require('../controller/food');
const errHandler = require('../utils/errhandler');

router.get('/all/:id',errHandler(getAllFoods))

router.get('/:id',errHandler(getFood))

router.use(errHandler(protect))

router.use(restricTo('admin','superAdmin'))

router.post('/add-food/:id',errHandler(addFood))

router.patch('/:id',errHandler(uploadFoodImg),errHandler(editFood))

router.delete('/:id',errHandler(deleteFood))

module.exports = router
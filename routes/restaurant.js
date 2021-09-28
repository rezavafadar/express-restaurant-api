const router = require('express').Router();

const { addRestaurant, getRestaurant, deleteRestaurant, editRestaurant, uploadImg, getAllRestaurant } = require('../controller/restaurant');
const errHandler = require('../utils/errhandler');

router.get('/:id',errHandler(getRestaurant))
router.get('/all/:id',errHandler(getAllRestaurant))

router.post('/add-restaurant',errHandler(addRestaurant))

router.patch('/:id',errHandler(uploadImg),errHandler(editRestaurant))

router.delete('/:id',errHandler(deleteRestaurant))

module.exports = router;
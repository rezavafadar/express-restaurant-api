const router = require('express').Router();

const {restricTo,protect} = require('../controller/auth');
const {addFood, getFood, getAllFoods} = require('../controller/food');

router.get('/all/:id',getAllFoods)

router.use(protect)

router.get('/:id',getFood)

router.use(restricTo('admin'))

router.post('/add-food/:id',addFood)

// router.patch('/:id')

// router.delete('/:id')
module.exports = router
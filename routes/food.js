const router = require('express').Router();

const {restricTo,protect} = require('../controller/auth');
const {addFood, getFood} = require('../controller/food');


router.use(protect)

router.get('/:id',getFood)

router.use(restricTo('admin'))

router.post('/add-food/:id',addFood)

// router.patch('/:id')

// router.delete('/:id')
module.exports = router
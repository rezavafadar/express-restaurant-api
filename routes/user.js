const router = require('express').Router();

const errHandler = require('../utils/errorHandler');

const userController = require('../controller/user');
const {protect,login,resetPassword,register,forgotPassword} = require('../controller/auth');

router.post('/register',errHandler(userController.uploadProfileImg),errHandler(register))

router.post('/login',errHandler(login))

router.post('/forgot-password',errHandler(forgotPassword))

router.patch('/reset-password/:token',errHandler(resetPassword))

router.get('/all/:id',errHandler(protect('superAdmin')),userController.getAllUser)

// Authenticate Middleware
router.use(errHandler(protect('user','superAdmin')))

// User Basket Routes
router.patch('/update-basket',userController.updateBasket)
router.delete('/reset-basket',userController.resetBasket)
router.get('/get-basket',userController.getBasket)

router.route('/:id')
       .get(errHandler(userController.getUser))
       .delete(errHandler(userController.deleteUser))
       .patch(errHandler(userController.uploadProfileImg),errHandler(userController.updateMe))



module.exports = router;
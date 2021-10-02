const router = require('express').Router();

const errHandler = require('../utils/errhandler');

const userController = require('../controller/user');
const protect = require('../controller/auth');

router.post('/register',errHandler(userController.uploadProfileImg),errHandler(userController.register))

router.post('/login',errHandler(userController.login))

router.post('/forgetpassword',errHandler(userController.forgetPassword))

router.patch('/resetpassword/:id',errHandler(userController.resetPassword))

router.get('/all/:id',errHandler(protect('superAdmin')),userController.getAllUser)

// Authenticate Middleware
router.use(errHandler(protect('user','superAdmin')))

// User Basket Routes
router.post('/basket',userController.updateBasket)
router.delete('/reset-basket',userController.resetBasket)
router.get('/get-basket',userController.getBasket)

router.route('/:id')
       .get(errHandler(userController.getUser))
       .delete(errHandler(userController.deleteUser))
       .patch(errHandler(userController.uploadProfileImg),errHandler(userController.updateMe))



module.exports = router;
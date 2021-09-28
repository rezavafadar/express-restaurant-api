const router = require('express').Router();

const errHandler = require('../utils/errhandler');

const userController = require('../controller/user');
const authController = require('../controller/auth');

router.post('/register',errHandler(authController.registerHandler) )
router.post('/login',errHandler(authController.loginHandler) )
router.post('/forgetpassword',errHandler(authController.forgetPassword) )
router.patch('/resetpassword/:id',errHandler(authController.resetPassword) )

// cauth user controller and protect all routes after this midlleware
router.use(errHandler(authController.protect))

router.get('/getuser',errHandler(userController.getUser) )
router.patch('/updateme',errHandler(userController.uploadProfileImg),errHandler(userController.updateMe))
router.delete('/deleteuser',errHandler(userController.deleteUser))

module.exports = router;
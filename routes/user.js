const router = require('express').Router();

const userController = require('../controller/user');
const authController = require('../controller/auth');

router.post('/register',userController.registerHandler)
router.post('/login',userController.loginHandler)
router.post('/forgetpassword',userController.forgetPassword)
router.post('/resetpassword/:id',userController.resetPassword)

// cauth user controller and protect all routes after this midlleware
router.use(authController.protect)

router.post('/updateme',userController.uploadProfileImg,userController.updateMe)
router.get('/getuser',userController.getUser)
module.exports = router;
const router = require('express').Router();

const userController = require('../controller/user');

router.post('/register',userController.registerHandler)
router.post('/login',userController.loginHandler)
router.post('/forgetpassword',userController.forgetPassword)
router.post('/resetpassword/:id',userController.resetPassword)
module.exports = router;
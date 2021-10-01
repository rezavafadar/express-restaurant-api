const router = require('express').Router();

const errHandler = require('../utils/errhandler');

const userController = require('../controller/user');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

router.post('/register',errHandler(userController.uploadProfileImg),errHandler(userController.register))

router.post('/login',errHandler(userController.login))

router.post('/forgetpassword',errHandler(userController.forgetPassword))

router.patch('/resetpassword/:id',errHandler(userController.resetPassword))

// cauth user controller and protect all routes after this midlleware
router.use(errHandler(userController.userAuthenticate)) 

router.route('/')
       .get(errHandler(userController.getUser))
       .delete(errHandler(userController.deleteUser))
       .patch(errHandler(userController.uploadProfileImg),errHandler(userController.updateMe))

router.get('/all/:id',userController.getAllUser)
module.exports = router;
const router = require('express').Router();

const errHandler = require('../utils/errhandler');

const userController = require('../controller/user');
const protect = require('../controller/auth');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

router.post('/register',errHandler(userController.uploadProfileImg),errHandler(userController.register))
router.get('/testtoken',async (req,res)=>{
       const user = await User.findById('6156f895003f5a23e9af6188')
       const token =await jwt.sign({id:user._id,role:user.role},'testdevelop')
       console.log(token);
})
router.post('/login',errHandler(userController.login))

router.post('/forgetpassword',errHandler(userController.forgetPassword))

router.patch('/resetpassword/:id',errHandler(userController.resetPassword))

router.get('/all/:id',errHandler(protect('superAdmin')),userController.getAllUser)

router.use(errHandler(protect('user','superAdmin')))

router.route('/:id')
       .get(errHandler(userController.getUser))
       .delete(errHandler(userController.deleteUser))
       .patch(errHandler(userController.uploadProfileImg),errHandler(userController.updateMe))

module.exports = router;
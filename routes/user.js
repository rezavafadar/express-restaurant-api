const router = require('express').Router();

const errHandler = require('../utils/errhandler');

const userController = require('../controller/user');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

router.post('/register',errHandler(userController.uploadProfileImg),errHandler(userController.register) )
router.post('/login',errHandler(userController.login))
router.get('/testtoken',async(req,res)=>{
    const user = await User.findById('6156f895003f5a23e9af6188')
    const token =await jwt.sign({id:user._id},'testdevelop')
    console.log(token);
})
router.post('/forgetpassword',errHandler(userController.forgetPassword) )
router.patch('/resetpassword/:id',errHandler(userController.resetPassword) )

// cauth user controller and protect all routes after this midlleware
router.use(errHandler(userController.userAuthenticate)) 

router.get('/getuser',errHandler(userController.getUser) )
router.patch('/updateme',errHandler(userController.uploadProfileImg),errHandler(userController.updateMe))


router.delete('/deleteuser',errHandler(userController.deleteUser))
router.get('/all/:id',userController.getAllUser)
module.exports = router;
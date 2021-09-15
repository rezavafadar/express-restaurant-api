const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const User = require("../model/user");
const errHandler = require("../utils/errhandler");

exports.registerHandler = errHandler(async (req, res) => {
  // handle validation error handler
  let errors;
  await User.validateBody(req.body).catch((err) => (errors = err.errors));
  if (errors)
    return res
      .status(400)
      .json({ message: "Bad Request! Validation faild", errors: errors });

  // create user
  const user = await User.findOne({ email: req.body.email });
  if (user)
    return res
      .status(400)
      .json({ message: "A user is available with this email" });

  const password = await bcrypt.hash(req.body.password, 10);
  let userInfo = {
    fullname: req.body.fullname,
    email: req.body.email,
    password,
  };
  await User.create(userInfo);

  res.status(201).json({ message: "user created !" });
});


exports.loginHandler = errHandler(async (req,res) =>{
    const {email,password} = req.body;

    if(email && password){
        const user =await User.findOne({email})
        if(!user) return res.status(404).json({'message':'user is not defined!'})

        const passMatch = await bcrypt.compare(password, user.password)

        if(!passMatch) return res.status(401).json({'message':'Unauthorized'})

        const token = jwt.sign({id:user._id},process.env.SECRET_JWTKEY)

        res.status(200).json({'message':'successful!','token':token})
    }else{
        return res.status(400).json({'message':'Bad Request ! email or password is wrong'})
    }
})
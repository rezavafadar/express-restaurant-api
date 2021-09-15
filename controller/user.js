const bcrypt = require("bcrypt");

const User = require("../model/user");
const errhandler = require("../utils/errhandler");

exports.registerHandler = errhandler(async (req, res) => {
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
  await User.create({ userInfo });
  
  res.status(201).json({ message: "user created !" });
});

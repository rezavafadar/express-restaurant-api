const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const uuid = require("uuid").v4;
const sharp = require("sharp");

const path = require("path");

const User = require("../model/user");
const errHandler = require("../utils/errhandler");

exports.getUser = errHandler(async (req, res) => {
  const {
    fullname = "",
    email = "",
    createAt = "",
    role = "",
    active = "",
    photo = "",
  } = await User.findById(req.params.id);
  if (fullname == "")
    return res.status(404).json({ message: "User Is Not Defined!" });

  res.status(200).json({
    message: "Find user is successfull!",
    data: { fullname, email, createAt, role, active, photo },
  });
});

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
  console.log(req.body.password);
  const password = await bcrypt.hash(req.body.password, 10);
  let userInfo = {
    fullname: req.body.fullname,
    email: req.body.email,
    password,
  };
  await User.create(userInfo);

  res.status(201).json({ message: "user created !" });
});

exports.loginHandler = errHandler(async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User is not defined!" });
    console.log(user.password);
    console.log(password);
    const passMatch = await bcrypt.compare(password, user.password);

    if (!passMatch) return res.status(401).json({ message: "Unauthorized" });

    const token = jwt.sign({ id: user._id }, process.env.SECRET_JWTKEY);

    res.status(200).json({ message: "Successful!", token: token });
  } else {
    return res
      .status(400)
      .json({ message: "Bad Request ! Email or password is wrong" });
  }
});

exports.forgetPassword = errHandler(async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "Bad Request! email is required" });

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User is not defined" });

  const token = jwt.sign(
    { id: user._id, resetPass: true },
    process.env.SECRET_JWTKEY
  );
  user.passwordResetToken = token;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save();
  const url = `http://localhost:3000/api/user/resetpassword/${token}`;
  res.status(200).json({ message: "successful!", url: url });
});

exports.resetPassword = errHandler(async (req, res) => {
  const { id } = req.params;
  let token;
  try {
    token = jwt.verify(id, process.env.SECRET_JWTKEY);
  } catch (er) {
    return res
      .status(400)
      .json({ message: "Bad Request ! Token is not valid" });
  }

  if (token.id && token.resetPass) {
    if (!req.body.password)
      return res.status(400).json({ message: "new password is required!" });
    const user = await User.findOne({
      passwordResetToken: id,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(401)
        .json({ message: "Token is invalid or has expired" });

    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordChangedAt = Date.now();
    await user.save();
    res.status(200).json({ message: "successfull!" });
  } else
    return res
      .status(401)
      .json({ message: "Bad Request ! Token is not valid" });
});

exports.uploadProfileImg = errHandler(async (req, res, next) => {
  if (!req.files) return next();
  console.log("upload controller:", req.files);

  const img = req.files ? req.files.profileImg : {};

  const fileName = `${uuid()}_${img.name}`;
  const uploadPath = path.join(
    __dirname,
    "..",
    "public",
    "uploadImgs",
    fileName
  );

  sharp(img.data)
    .toFormat("jpeg")
    .jpeg({ quality: 60 })
    .toFile(uploadPath)
    .catch((err) => console.log(err));

  req.profileImg = fileName;
  next();
});

const filtredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = errHandler(async (req, res) => {

  const body = req.body;

  if (body.password || body.role)
    return res.status(400).json({
      message: "Bad Request ! The request contains sensitive information",
    });

  const obj = filtredObj(body, "fullname", "email");

  if (req.profileImg) obj.photo = req.profileImg;

  await User.findByIdAndUpdate(req.user.id, obj);

  res.status(200).json({ message: "Edit is successfull!" });
});

exports.deleteUser = errHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false})

  res.status(200).json({'status':'success'})
})

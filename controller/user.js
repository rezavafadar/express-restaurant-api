const uuid = require('uuid').v4;
const sharp = require('sharp');

const path = require('path');

const User = require('../model/user');
const filtredObj = require('../utils/filteredObj');

const getUser = async (req, res) => {
  const {
    fullname = '',
    email = '',
    createAt = '',
    role = '',
    active = '',
    photo = '',
  } = await User.findById(req.params.id);
  if (fullname === '')
    return res.status(404).json({ message: 'User is not defined!' });

  res.status(200).json({
    message: 'Find user is successfull!',
    data: { fullname, email, createAt, role, active, photo },
  });
};

const uploadProfileImg = async (req, res, next) => {
  if (!req.files) return next();

  const img = req.files ? req.files.profileImg : {};

  const fileName = `${uuid()}_${img.name}`;
  const uploadPath = path.join(
    __dirname,
    '..',
    'public',
    'uploadImgs',
    fileName
  );

  sharp(img.data)
    .toFormat('jpeg')
    .jpeg({ quality: 60 })
    .toFile(uploadPath)
    .catch((err) => console.log(err));

  req.profileImg = fileName;
  next();
};

const updateMe = async (req, res) => {

  const body = req.body;

  if (body.password || body.role)
    return res.status(400).json({
      message: 'Bad Request ! The request contains sensitive information',
    });

  const obj = filtredObj(body, 'fullname', 'email');

  if (req.profileImg) obj.photo = req.profileImg;

  await User.findByIdAndUpdate(req.user.id, obj);

  res.status(200).json({ message: 'Edit is successfull!' });
};

const deleteUser = async(req,res)=>{
  
  await User.findByIdAndUpdate(req.user.id,{active:false})

  res.status(200).json({'status':'success'})
};

const getAllUser = async (req,res)=>{
  if(req.user.role != 'superAdmin') return res.status(401).json({'message':'Bad request! you do not have permission to perform this action'})
  const {id} = req.params

  const users = await User.find({}).skip((id-1)*10).exec(10)

  res.status(200).json({'message':'successfull!',data:users})
}

module.exports={
  getUser,
  uploadProfileImg,
  updateMe,
  deleteUser,
  getAllUser
}
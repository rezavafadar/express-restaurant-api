const jwt = require('jsonwebtoken');
const User = require('../model/user');
const errHandler = require('../utils/errhandler');

exports.protect = errHandler(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	)
		token = req.headers.authorization.split(' ')[1];
	else
		return res
			.status(400)
			.json({
				message: 'You are not logged in! Please log in to get access.',
			});

	let decoded;
	try {
		decoded = await jwt.verify(token, process.env.SECRET_JWTKEY);
	} catch (er) {
		return res.status(400).json({ message: 'token is not valid!' });
	}

	const currentUser = await User.findById(decoded.id);

	if (!currentUser)
		return res.status(401).json({
			message: 'The user belonging to this token does no longer exist',
		});

  if(currentUser.changedPasswordAfter(decoded.iat)){
    return res.status(401).json({'message':'User recently changed password! Please log in again'})
  }
  
	req.user = currentUser;
	next();
});

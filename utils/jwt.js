const jwt = require('jsonwebtoken');

const signToken =data=> jwt.sign(data, process.env.SECRET_JWTKEY);

const verifyToken = token =>{
    try {
        return jwt.verify(token,process.env.SECRET_JWTKEY)
    } catch (er) {
        return false
    }
}

module.exports ={
    signToken,
    verifyToken
}

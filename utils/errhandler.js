module.exports = fn=> (req,res,next) => fn(req,res,next).catch(err =>{
    console.log(err);
    if(err.JsonWebTokenError) console.log('yeah..');
  return res.status(500).json({'message':'internal server error'})  
} )
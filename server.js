const app = require('./app')();
const connectDB = require('./utils/connectDB');

connectDB()

let port = process.env.PORT || 3000
app.listen(port,(err) => console.log(`server is runing ${process.env.NODE_ENV} mode on port ${port}`))
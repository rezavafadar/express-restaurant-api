const app = require('./App')();
const connectDB = require('./database/connectDB');

connectDB()

const port = process.env.PORT || 3000

app.listen(port,(err) => console.log(`server is runing ${process.env.NODE_ENV} mode on port ${port}`))
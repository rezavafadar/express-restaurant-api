const mongoose = require("mongoose");

const uri =
  process.env.NODE_ENV == "dev"
    ? process.env.DEVELOP_DB_URI
    : process.env.PRODUCTION_DB_URI;

module.exports = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      useCreateIndex: true,
      useFindAndModify: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`connected to db ${conn.connection.host}..`);
  } catch (err) {
      console.log(err);
      process.exit(1)
  }
};

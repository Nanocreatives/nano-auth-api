const mongoose = require('mongoose');

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  const mongooseOpts = {
    useCreateIndex: true,
    keepAlive: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  };

  await mongoose.connect(process.env.MONGO_URL, mongooseOpts);
};

/**
 * Drop mongoose, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  const { collections } = mongoose.connection;

  Object.keys(collections).forEach((key) => {
    const collection = collections[key];
    collection.deleteMany();
  });
};

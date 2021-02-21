const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/users';

const UserSchema = new mongoose.Schema({
  id: Number,
  login: String,
  display_name: String,
  description: String,
  email: String
});
const UserModel = mongoose.model('User', UserSchema);

mongoose.Promise = global.Promise;

const db = {
  mongoose: mongoose,
  url: url,
  models: {
    UserModel: UserModel
  }
};

module.exports = db;

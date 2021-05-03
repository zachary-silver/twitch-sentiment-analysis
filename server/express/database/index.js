const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/users';

const UserSchema = new mongoose.Schema({
  id: Number,
  login: String,
  display_name: String,
  description: String,
  email: String,
  profile_image_url: String,
  created_at: Date
});
const UserModel = mongoose.model('User', UserSchema);

const MessageSchema = new mongoose.Schema({
  time_stamp: Date,
  channel: String,
  content: String
});
const MessageModel = mongoose.model('Message', MessageSchema);

mongoose.Promise = global.Promise;

const db = {
  mongoose: mongoose,
  url: url,
  models: {
    UserModel: UserModel,
    MessageModel: MessageModel
  }
};

module.exports = db;

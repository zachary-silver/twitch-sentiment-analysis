const mongoose = require('mongoose');
const dotenv   = require('dotenv');

dotenv.config();

async function populateModels(db) {
  db.models.UserModel
    .find()
    .exec((err, result) => {
      if (err) {
        console.error(err);
      } else {
        result.forEach(user => {
          const channel = user['display_name'].toLowerCase();
          db.models[`${channel}MessageModel`] = new db.mongoose.model(
            `${channel}_messages`, db.schemas.MessageSchema
          );
        });
      }
    });
}

const UserSchema = new mongoose.Schema({
  id: Number,
  login: String,
  display_name: String,
  description: String,
  email: String,
  profile_image_url: String,
  created_at: Date,
  channel: String
});
const UserModel = mongoose.model('users', UserSchema);

const MessageSchema = new mongoose.Schema({
  time_stamp: Date,
  content: String
});
const MessageModel = mongoose.model('messages', MessageSchema);

mongoose.Promise = global.Promise;

let db = {
  mongoose: mongoose,
  url: process.env.MONGO_DB_URL,
  schemas: {
    UserSchema: UserSchema,
    MessageSchema: MessageSchema
  },
  models: {
    UserModel: UserModel,
    MessageModel: MessageModel
  },
  populateModels: populateModels
};

module.exports = db;

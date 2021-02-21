const express        = require('express');
const passport       = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const request        = require('request');
const config         = require('../config');
const db             = require('../database/index');

const router = express.Router();

function handleError(err) {
  if (err) {
    console.log(err);
  }
}

db.mongoose
  .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to ${db.url}`);
  })
  .catch(err => {
    console.log(`Failed to connect to ${db.url}`, err);
    process.exit();
  });

OAuth2Strategy.prototype.userProfile = (accessToken, callback) => {
  var options = {
    url: config.TWITCH_API_URL + '/users',
    method: 'GET',
    headers: {
      'Client-ID': config.TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  request(options, (error, response, body) => {
    if (response && response.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback(JSON.parse(body));
    }
  });
}

passport.use('twitch', new OAuth2Strategy({
    authorizationURL: config.TWITCH_AUTH_URL,
    tokenURL: config.TWITCH_TOKEN_URL,
    clientID: config.TWITCH_CLIENT_ID,
    clientSecret: config.TWITCH_SECRET,
    callbackURL: config.CALLBACK_URL,
    state: true
  },
  (accessToken, refreshToken, profile, callback) => {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    db.models.UserModel
      .find({'id': profile.data[0].id})
      .exec((err, result) => {
        if (!err && result.length == 0) {
          db.models.UserModel
            .create({ ...profile.data[0] }, (err) => handleError(err));
        }
      });

    callback(null, profile);
  }
));

passport.serializeUser((user, callback) => {
    callback(null, user);
});

passport.deserializeUser((user, callback) => {
    callback(null, user);
});

router.get('/auth', passport.authenticate('twitch', { scope: 'user_read' }));

router.get('/auth/callback',
  passport.authenticate('twitch',
    { successRedirect: '/', failureRedirect: '/failure' }
  )
);

router.get('/users', (req, res) => {
  db.models.UserModel
    .find()
    .exec((err, result) => {
      if (!err) {
        res.send(result);
      }
    });
});

module.exports = { router, passport };

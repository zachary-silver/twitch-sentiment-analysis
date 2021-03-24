const express        = require('express');
const passport       = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const request        = require('request');
const fetch          = require('node-fetch');
const config         = require('../config');
const db             = require('../database/index');

const router = express.Router();
let user;

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
  const options = {
    url: config.TWITCH_API_URL + '/users',
    method: 'GET',
    headers: {
      'Client-Id': config.TWITCH_CLIENT_ID,
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
    user = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      ...profile.data[0]
    }

    db.models.UserModel
      .find({'id': profile.data[0].id})
      .exec((err, result) => {
        if (!err && result.length == 0) {
          db.models.UserModel.create({ ...profile.data[0] }, handleError);
        }
      });

    callback(null, user);
  }
));

passport.serializeUser((user, callback) => {
    callback(null, user);
});

passport.deserializeUser((user, callback) => {
    callback(null, user);
});

router.get('/login', passport.authenticate('twitch', { scope: 'user_read' }));

router.get('/login/callback',
  passport.authenticate('twitch',
    {
      successRedirect: 'http://localhost:5000/',
      failureRedirect: 'http://localhost:5000/'
    }
  )
);

router.get('/logout', (req, res) => {
  if (user) {
    const url = 'https://id.twitch.tv/oauth2/revoke' +
                `?client_id=${config.TWITCH_CLIENT_ID}` +
                `&token=${user.accessToken}`;
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'x-www-form-urlencoded',
      }
    };

    fetch(url, options)
      .then(response => {
        user = null;
        return { active: user }
      })
      .then(result => res.send(result))
      .catch(err => console.log(err) || res.send({ active: user }));
  } else {
    res.send({ active: user })
  }
});

router.get('/user', (req, res) => {
  res.send({ active: user });
});

router.get('/users', (req, res) => {
  db.models.UserModel
    .find()
    .exec((err, result) => {
      if (!err) {
        res.send(result);
      }
    });
});

router.get('/streams', (req, res) => {
  if (user) {
    const url = 'https://api.twitch.tv/helix/streams';
    const options = {
      headers: {
        'Client-Id': config.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + user.accessToken,
        'Accept': 'application/json'
      }
    };

    fetch(url, options)
      .then(response => response.json())
      .then(result => res.send(result));
  } else {
    res.send({message: 'No valid user session'});
  }
});

router.get('/channel', (req, res) => {
  if (user) {
    const url = 'https://api.twitch.tv/helix/channels' +
                `?broadcaster_id=${user.id}`;
    const options = {
      headers: {
        'Client-Id': config.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + user.accessToken,
        'Content-Type': 'x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    };

    fetch(url, options)
      .then(response => response.json())
      .then(result => res.send(result));
  } else {
    res.send({message: 'No valid user session'});
  }
});

router.get('/videos', (req, res) => {
  if (user) {
    const user_id = 71092938;
    const url = 'https://api.twitch.tv/helix/videos' +
                `?user_id=${user_id}`;
    const options = {
      headers: {
        'Client-Id': config.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + user.accessToken,
        'Content-Type': 'x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    };

    fetch(url, options)
      .then(response => response.json())
      .then(result => res.send(result));
  } else {
    res.send({message: 'No valid user session'});
  }
});

module.exports = { router, passport };

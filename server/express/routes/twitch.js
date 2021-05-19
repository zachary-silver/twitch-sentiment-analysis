const express        = require('express');
const dotenv         = require('dotenv');
const passport       = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const request        = require('request');
const fetch          = require('node-fetch');
const db             = require('../database/index');

dotenv.config();

const router = express.Router();

function handleError(err) {
  if (err) {
    console.error(err);
  }
}

function clearSession(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }

    res.send({ ...req.session?.passport?.user });
  });
}

db.mongoose
  .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to ${db.url}`);
  })
  .catch(err => {
    console.error(`Failed to connect to ${db.url}`, err);
    process.exit();
  });

db.populateModels(db);

OAuth2Strategy.prototype.userProfile = (accessToken, callback) => {
  const options = {
    url: process.env.TWITCH_API_URL + '/users',
    method: 'GET',
    headers: {
      'Client-Id': process.env.TWITCH_CLIENT_ID,
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
    authorizationURL: process.env.TWITCH_AUTH_URL,
    tokenURL: process.env.TWITCH_TOKEN_URL,
    clientID: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    state: true
  },
  (accessToken, refreshToken, profile, callback) => {
    const user = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      ...profile.data[0]
    }

    db.models.UserModel
      .find({'id': user.id})
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
  const user = req.session?.passport?.user;

  if (user) {
    const url = 'https://id.twitch.tv/oauth2/revoke' +
                `?client_id=${process.env.TWITCH_CLIENT_ID}` +
                `&token=${user.accessToken}`;
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'x-www-form-urlencoded',
      }
    };

    fetch(url, options)
      .then(innerRes => {
        innerRes.status == 200
          ? clearSession(req, res)
          : handleError(innerRes.statusText);
      })
      .catch(handleError);
  } else {
    res.send({ ...user });
  }
});

router.get('/user', (req, res) => {
  res.send({ ...req.session?.passport?.user });
});

router.get('/users', (req, res) => {
  db.models.UserModel
    .find()
    .exec((err, result) => {
      if (!err) {
        res.send({ users: result });
      } else {
        res.send({ users: [] });
      }
    });
});

router.get('/messages/oldest', (req, res) => {
  let user = req.session?.passport?.user;

  if (user) {
    let channel = user.display_name.toLowerCase();

    if (channel === 'creamyzor') {
      channel = 'moonmoon';
    }

    db.models[`${channel}MessageModel`]
      .findOne()
      .exec((err, result) => {
        if (!err) {
          res.send({ message: result });
        } else {
          res.send({ message: {} });
        }
      });
  } else {
    res.send({ message: {} });
  }
});

async function retrieveSentiments(result, res) {
  const nextPage = result.nextPage;
  const messages = result.messages;

  fetch('http://localhost:8080/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messages })
  })
    .then(response => response.json())
    .then(result => {
      res.send({
        messages: result.sentiments.map((sentiment, index) => {
          return {
            time_stamp: messages[index].time_stamp,
            sentiment: sentiment
          };
        }),
        nextPage: nextPage
      });
    });
}

router.get('/messages/:from-:to/:page', (req, res) => {
  const user = req.session?.passport?.user;
  const pageSize = 100000;

  if (user) {
    const from = new Date(parseInt(req.params.from)).toISOString();
    const to = new Date(parseInt(req.params.to)).toISOString();
    const page = parseInt(req.params.page);
    let channel = user.display_name.toLowerCase();

    if (channel === 'creamyzor') {
      channel = 'moonmoon';
    }

    db.models[`${channel}MessageModel`]
      .find({
        time_stamp: { $gte: from, $lt: to }
      })
      .skip(page * pageSize)
      .limit(pageSize)
      .exec((err, result) => {
        if (!err) {
          const nextPage = result.length < pageSize ? page : page + 1;
          retrieveSentiments({ messages: result, nextPage: nextPage }, res);
        } else {
          res.send({ messages: [], nextPage: -1 });
        }
      });
  } else {
    res.send({ messages: [], nextPage: -1 });
  }
});

router.get('/report', (req, res) => {
  const user = req.session?.passport?.user;

  if (user) {
    fetch('http://localhost:8080/report')
      .then(response => response.json())
      .then(result => res.send(result));
  } else {
    res.send({ error: 'No valid user session.' });
  }
});

router.get('/streams', (req, res) => {
  const user = req.session?.passport?.user;

  if (user) {
    const url = `${process.env.TWITCH_API_URL}/streams`;
    const options = {
      headers: {
        'Client-Id': process.env.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + user.accessToken,
        'Accept': 'application/json'
      }
    };

    fetch(url, options)
      .then(response => response.json())
      .then(result => res.send(result));
  } else {
    res.send({ error: 'No valid user session.' });
  }
});

router.get('/channel', (req, res) => {
  const user = req.session?.passport?.user;

  if (user) {
    const url = `${process.env.TWITCH_API_URL}/channels` +
                `?broadcaster_id=${user.id}`;
    const options = {
      headers: {
        'Client-Id': process.env.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + user.accessToken,
        'Content-Type': 'x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    };

    fetch(url, options)
      .then(response => response.json())
      .then(result => res.send(result));
  } else {
    res.send({ error: 'No valid user session.' });
  }
});

router.get('/videos', (req, res) => {
  const user = req.session?.passport?.user;

  if (user) {
    const userId = 71092938;
    const url = `${process.env.TWITCH_API_URL}/videos` +
                `?user_id=${userId}`;
    const options = {
      headers: {
        'Client-Id': process.env.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + user.accessToken,
        'Content-Type': 'x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    };

    fetch(url, options)
      .then(response => response.json())
      .then(result => res.send(result));
  } else {
    res.send({ error: 'No valid user session' });
  }
});

module.exports = { router, passport };

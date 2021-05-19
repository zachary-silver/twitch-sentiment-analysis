const express     = require('express');
const session     = require('express-session');
const cors        = require('cors');
const dotenv      = require('dotenv');
const twitchRoute = require('./routes/twitch');

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
app.use(express.static('public'));
app.use(twitchRoute.passport.initialize());
app.use(twitchRoute.passport.session());
app.use(cors({
  origin: (origin, callback) => callback(null, [origin]),
  credentials: true
}));

app.use('/twitch', twitchRoute.router);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
});

const express     = require('express');
const session     = require('express-session');
const cors        = require('cors');
const config      = require('./config');
const indexRoute  = require('./routes/index');
const twitchRoute = require('./routes/twitch');

const app = express();

app.use(session({
    secret: config.SESSION_SECRET,
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

app.use('/', indexRoute.router);
app.use('/twitch', twitchRoute.router);

app.listen(config.PORT, () => {
  console.log(`Listening on port ${config.PORT}`)
});

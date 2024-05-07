const session = require('express-session');

const sessionMiddleware = session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true,
    maxAge: 1* 1* 30 * 1000, 
  },
});

module.exports = 
    sessionMiddleware;

const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

module.exports = (passport) => {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, async (email, password, done) => {
    const user = await User.findOne({email: email});
    if (!user) {
      return done(null, false, {message: 'No User Found'});
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message: 'Incorrect Password'});
      }
    })
  }))

};

const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/tasks',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// REGISTER
router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', async (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({text: 'passwords do not match.'})
  }
  if (req.body.password.length < 4) {
    errors.push({text: 'passwords must be at least 4 characters.'})
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    let user = await User.findOne({email: req.body.email});
    if (user) {
      req.flash('error_msg', 'Email already registered.');
      res.redirect('/users/login');
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash;
      await newUser.save();
      req.flash('success_msg', 'You are Registered and can Log In.');
      res.redirect('/users/login');
    }
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;

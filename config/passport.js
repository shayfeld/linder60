const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'userId' }, (userId, password, done) => {
      // Match user
      User.findOne({
        userId: userId
      }).then(user => {
        if (!user) {
          return done(null, false, errors.push({msg:'תעודת זהות לא קיימת במערכת'}));
        }

        // Match password
        bcrypt.compare(userId, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, errors.push({msg:'הסיסמא לא תואמת את הנתונים במערכת'}));
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
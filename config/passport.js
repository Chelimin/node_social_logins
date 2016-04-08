var User = require('../models/user');
var FacebookStrategy = require('passport-facebook').Strategy;
var passport = require('passport');

var GitHubStrategy = require('passport-github').Strategy;
var GITHUB_CLIENT_ID = "60cf3c3f10bafed9801c";
var GITHUB_CLIENT_SECRET = "95e62b416c017456670f5796cf571fed988accc2";


module.exports = function(passport){

  passport.serializeUser(function(user, done) {
    done(null, user._id);
    //"._id" is a mongodb convention
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      console.log('deserializing user:',user);
      done(err, user);
    });
  });

  passport.use('facebook', new FacebookStrategy({
    clientID        : process.env.FACEBOOK_API_KEY,
    clientSecret    : process.env.FACEBOOK_API_SECRET,
    callbackURL     : 'http://localhost:3000/auth/facebook/callback',
    enableProof     : true,
    profileFields   : ['name', 'emails']
  }, function(access_token, refresh_token, profile, done) {

    // // Use this to see the information returned from Facebook
    // console.log(profile)

    process.nextTick(function() {

      User.findOne({ 'fb.id' : profile.id }, function(err, user) {
        if (err) return done(err);
        if (user) {
          return done(null, user);
        } else {

          var newUser = new User();
          newUser.fb.id           = profile.id;
          newUser.fb.access_token = access_token;
          newUser.fb.firstName    = profile.name.givenName;
          newUser.fb.lastName     = profile.name.familyName;
          newUser.fb.email        = profile.emails[0].value;

          newUser.save(function(err) {
            if (err)
              throw err;

            return done(null, newUser);
          });
        }

      });
    });
  }));

  //GITHUB

  // passport.use(new GitHubStrategy({
  //   clientID: GITHUB_CLIENT_ID,
  //   clientSecret: GITHUB_CLIENT_SECRET,
  //   callbackURL: "http://localhost:3000/auth/github/callback"
  // },
  // function(accessToken, refreshToken, profile, cb) {
  //
  //   process.nextTick(function() {
  //
  //     User.findOne({ 'gh.id' : profile.id }, function(err, user) {
  //       if (err) return cb(err);
  //       if (user) {
  //         return cb(null, user);
  //       } else {
  //
  //         var newUser = new User();
  //         newUser.gh.id           = profile.id;
  //         newUser.gh.access_token = access_token;
  //         newUser.gh.firstName    = profile.name.givenName;
  //         newUser.gh.lastName     = profile.name.familyName;
  //         newUser.gh.email        = profile.emails[0].value;
  //
  //         newUser.save(function(err) {
  //           if (err)
  //             throw err;
  //
  //           return cb(null, newUser);
  //         });
  //       }
  //
  //     });
  //   });
  //   }));

  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(access_token, refreshToken, profile, done) {
    User.findOne({ 'gh.id': profile.id }, function(err, user) {
      if(err) {
        console.log(err);  // handle errors!
      }
      if (!err && user !== null) {
        done(null, user);
      } else {
        // user = new User({
        //   oauthID: profile.id,
        //   name: profile.displayName,
        //   created: Date.now()
      // });
          var newUser = new User();
          newUser.gh.id           = profile.id;
          newUser.gh.access_token = access_token;
          newUser.gh.name    = profile.displayName;
        newUser.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            console.log("saving user");
            done(null, user);
          }
        });
      }
    });
  }
));
};

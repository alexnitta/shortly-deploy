var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index', {env: process.env.NODE_ENV}); // add a second parameter for {env: app.get('env')} which will pass it the NODE_ENV variable
  // and then within the layout.ejs file, add a condition like <% if env === 'production' { %>
};

exports.signupUserForm = function(req, res) {
  res.render('signup', {env: process.env.NODE_ENV});
};

exports.loginUserForm = function(req, res) {
  res.render('login', {env: process.env.NODE_ENV});
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });
        newLink.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
    .fetch()
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}).exec(function(err, username) {
    if (err) {
      console.log(err);
    } else if (!username) {
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save(function(err, user) {
        if (err) {
          console.log(err);
        } else {
          util.createSession(reg, res, user);
        } 
      });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }).exec(function(err, link) {
    if (err) {
      console.log(err);
    } else if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save(function(err, link) {
        if (err) {
          console.log(err);
        } else {
          res.redirect(link.url);
          return;
        }
      });
    }
  });
};

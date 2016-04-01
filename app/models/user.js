var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: {type: String, unique: true },
  password: String
});


var User = mongoose.model('User', UserSchema);

User.prototype.comparePassword = function(attemptedPassword, savedPassword, callback) {
  bcrypt.compare(attemptedPassword, savedPassword, function(err, isMatch) {
    if (err) {
      callback(err);
    } else {
      callback(null, isMatch);
    }
  });
};

UserSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
});

module.exports = User;

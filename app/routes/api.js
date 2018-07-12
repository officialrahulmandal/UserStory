var User = require('../models/user');
var config = require('../../config');


var secretKey = config.secretKey;

module.exports = function(app, express) {

  var api = express.Router();
  var bcrypt = require('bcrypt-nodejs')

  api.post('/signup', function(req, res) {

    var user = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    });

    console.log(user);
    user.save(function(err) {
      console.log("check",err)
      if(err) {
        res.send(err);
        return;
      }

      res.json({ message: 'User has been created'});
    });
  });

  api.get('/users', function(req, res) {

    User.find({}, function(err, users) {
      if(err) {
        res.send(err);
        return;
      }

      res.json(users);
    });
  });

  return api
}

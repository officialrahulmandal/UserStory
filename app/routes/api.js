var User = require('../models/user');
var config = require('../../config');


var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {
  var token = jsonwebtoken.sign({
    _id: user._id,
    name: user.name,
    username: user.username
  }, secretKey, {
    expiresIn: 604800
  });
  return token;
}

module.exports = function(app, express) {

  var api = express.Router();

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

  api.post('/login', function(req, res) {
    User.findOne({
      username: req.body.username
    }).select('password').exec(function(err, user) {
      if(err) throw err;
      if(!user)  {
        res.send({message: "User doesn't exist"});
      } else if(user) {
        var validPassword = user.comparePassword(req.body.password);

        if(!validPassword) {
          res.send({message: "Invalid Password"});
        } else {
          var token = createToken(user);

          res.json({
            sucess: true,
            message: "Successfuly login!",
            token: token
          });
        }
      }
    });
  });

  api.use(function(req, res, next)  {
    console.log('Somebody just came to our app!');
    
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    if(token) {
      jsonwebtoken.verify(token, secretKey, function(err, decoded) {
        if(err) {
          res.status(403).send({ success: false, message: "Failed to authenticate  user"});
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      console.log("your token is"+ req +token);
      res.status(403).send({success: false, message: "No Tooken Provided"});
    }
  });

  api.get('/', function(req, res) {
    res.json("Hello world");
  })


  return api
}

require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
var shortid = require('shortid');
var date = require('date-and-time');

var {mongoose} = require('./db/mongoose');
var {Licence} = require('./models/licence');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------------------
// licence Api for client
// --------------------------------

app.post('/getdetailById', (req, res) => {
  var deviceid = req.body.deviceid;

  Licence.findOne({deviceid}).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/verifyKey', (req, res) => {
  var key = req.body.key;
  var deviceid = req.body.deviceid;

  Licence.findOne({key}).then((doc) => {
    if (!doc) {
      return res.status(404).send("no doc");
    }
    //res.send(doc);



    if (doc.active === true) {
      return res.status(404).send("false");
    };
    var year = doc.year;
    var ad = date.format(new Date(), 'DD-MM-YYYY');
    let now = new Date();
    var edd = date.addYears(now, year);
    var ed = date.format(new Date(edd), 'DD-MM-YYYY');
    var active = true;

    Licence.findOneAndUpdate({key}, {$set: {year,ad,ed,active,deviceid}}, {new: true}).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  })


  }).catch((e) => {
    res.status(400).send();
  });
});

// --------------------------------
// licence Api for creater
// --------------------------------


app.post('/createKeys', authenticate, (req, res) => {
  var year = req.body.year;
  var number = req.body.number;

  for (var i = 0; i < number; i++) {

    var licence = new Licence({
      key : shortid.generate(),
    _creator: req.user._id,
    
  });

      licence.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
    
  };

});

app.post('/createKey', authenticate, (req, res) => {
  var key = shortid.generate();

  var licence = new Licence({
    key,
    year : req.body.year,
    _creator: req.user._id,

  });

  licence.save().then((doc) => {
    res.send(doc);
    }, (e) => {
    res.status(400).send(e);
  });

});


app.post('/getAllKey', authenticate, (req, res) => {
  Licence.find({active : false}).then((doc) => {
    res.send({doc});
  }, (e) => {
    res.status(400).send(e);
  });
});


app.post('/getdetailByKey', authenticate, (req, res) => {
  var key = req.body.key;

  Licence.findOne({key}).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  });
});


app.post('/removeKey', authenticate, (req, res) => {
  var key = req.body.key;

  Licence.findOneAndRemove({key}).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
    
  });
});


app.post('/updateKey', authenticate, (req, res) => {

  var key = req.body.key;
  var body = _.pick(req.body, ['key', 'ad','ed', 'deviceid','active','year']);


  Licence.findOneAndUpdate({key}, {$set: body}, {new: true}).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  })
});

// --------------------------------
// user for licence creator
// --------------------------------

app.post('/loginUser', (req, res) => {
  var body = _.pick(req.body, ['username', 'password']);

  User.findByCredentials(body.username, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send({token,user});
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/logoutUser', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

// app.post('/registerUser', (req, res) => {
//   var body = _.pick(req.body, ['username', 'password']);
//   var user = new User(body);

//   user.save().then(() => {
//     return user.generateAuthToken();
//   }).then((token) => {
//     res.header('x-auth', token).send({token,user});
//   }).catch((e) => {
//     res.status(400).send(e);
//   })
// });


// --------------------------------
// listen
// --------------------------------

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};

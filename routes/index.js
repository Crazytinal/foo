var express = require('express');
var validator = require('../public/js/validator');
var api = require('../public/js/api');
var debug = require("debug")('signin:index');
var bcrypt = require('../node_modules/bcrypt-nodejs/bCrypt');
   var _ = require('lodash');

//to check the video how to require usermanger
// var userManager = require('./userManager')(db);


var mongo = require('mongodb').MongoClient;

var mongourl = 'mongodb://localhost:27017/signin';

    var router = express.Router();
var db;
var userslist;
var userManager;
mongo.connect(mongourl).catch(function(error) {
    debug("Connect to mongodb " + mongourl + "was failed with error: " + error);
  }).then(function(db_) {
   db = db_;
   userslist = db.collection('userslist');
   userManager = require("../public/js/userManager")(db);
console.log(userManager);
  });



/* GET regist page. */
router.get('/regist', function(req, res) {
    if (is_user_login(req)) {
        req.session.err = '请先注销';
        res.redirect(301, '/?username=' + req.session.user.username);
    }
    else {
        res.render('regist', {user: {username: 'durant35',
                    sid: '14331000',
                    phone: '12341234213',
                    email: 'durant@nam.com',
                    password: "durant35"
                }});
    }
});

router.post('/regist', function(req, res) {
        var user_ = req.body;
        userManager.checkUser(user_)
            .then(userManager.createUser)
                .then(function () {
                
            req.session.user = user_;
            res.redirect(301, '/?username=' + req.session.user.username);
            })
            .catch (function (err) {
                console.warn("regist error: ", err);
                res.render('regist', {user: user_, error: err});
            });
    

});

router.get('/signin', function(req, res) {
    if (is_user_login(req))
        res.redirect(301, '/?username=' + req.session.user.username);
    else 
        res.render('signin', {title: '登陆'});
});

router.post('/signin', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
     userManager.findUser(username, password).then(function(user) {
           req.session.user = user;
           res.redirect(301, '/?username=' + req.session.user.username);            

    }).catch(function() {
            res.render('signin', {title: '登陆', username: username, error:'用户名密码错误' });
    });

});

router.post('/api/validate-unique', function(req, res) {
    userslist.find({}).toArray(function(err, users_) {
        var userlists = {};
        //turn array into dic with key of username
        for (var key in users_) {
            userlists[users_[key].username] = users_[key];
        }
        api.validateUnique(userlists,req,res);
    });
 
});

router.post('/signout', function(req, res) {
    console.log('received');
    console.log(req.session);
    delete req.session.user;
    delete req.session.err;
    console.log(req.session);
    res.redirect(301, '/signin');
});

router.get('/', function(req, res) {
    console.log(req.session);
    var username = req.query.username;
    try {
    var err = req.session.err;
        console.log(username);

    delete req.session.err;
    if (username == req.session.user.username)
        res.render('detail', {user: req.session.user, error: err});
    else {
        if (username)
            req.session.err = '只能够访问自己的数据';
        res.redirect(301, '/?username='+ req.session.user.username);
    }
    } catch (err) {
        res.redirect(301, '/signin');
    }

});


// function checkUser(user) {
//     var errorMessages = [];
//     var userlists = {};
//   //temporary ... get from database
//     return new Promise(function(resolve, reject) {
//     userslist.find({}).toArray(function (err, users) {
//         //turn an array into object
//         for (var key in users) {
//             if (key != 'password' && key != '_id')
//             userlists[users[key].username] = users[key];
//         }
//           for(var key in user) {
//             if (key != 'password' && key != '_id') {

//             if (!validator.isFieldValid(key, user[key])) errorMessages.push(validator.form[key].errorMessage);
//             if (!validator.isAttrValueUnique(users, user, key)) errorMessages.push(
//               "key: " + key + " is not unique by value: " + user[key] + '</br>'
//             );
//             }
//           }
//       errorMessages.length>0 ? reject(errorMessages) : resolve(user);

//     });
//   });
// }

function is_user_login(req) {
    return !!req.session.user;
}




    
module.exports = router;

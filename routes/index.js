var express = require('express');
var validator = require('../public/js/validator.js');
var api = require('../public/js/api.js');
var debug = reuqire("debug")('signin:index');
var router = express.Router();
//to check the video how to require usermanger
// var userManager = require('./userManager')(db);


module.exports = function(db) {
  var users = db.collection('users');
  debug("users collection set up as: ", users);


/* GET regist page. */
router.get('/regist', function(req, res) {
    //todo if the user has log in..turn to detail page
    if (is_user_login(req)) {
        req.session.err = '请先注销';
        res.redirect(301, '/?username=' + req.session.user.username);
    }
    else
        res.render('regist', {user: {
                    username: 'durant35',
                    sid: '14331000',
                    phone: '12341234213',
                    email: 'durant@nam.com',
                    password: "durant35"
                }});
});

router.post('/regist', function(req, res) {
    try {
        var user_ = req.body;
        //todo some delete... id and password_confirm
        checkUser(user_);
        users[user.username] = user;
        // userManager.createUser(user_).then(function(user) {
            // user = {
            //     username: 'durant35',
            //     sid: '14331000',
            //     phone: '12341234213',
            //     email: 'durant@nam.com',
            //     password: "durant35"
            // }; // temporary
            user = user_;
            req.session.user = user;
            res.redirect(301, '/?username=' + req.session.user.username);
        // });
    } catch (err) {
        console.warn("regist error: ", err);
        res.render('regist', {user: user_, error: err});
    }
});

router.get('/signin', function(req, res) {
    if (is_user_login(req)) {
        //redirect to detail page
        res.redirect(301, '/?username=' + req.session.user.username);
    }
    else if (req.session.err) {
        var err = req.session.err;
        delete req.session.err;
        var lastUser = req.session.lastUser;
        delete req.session.lastUser;
        res.render('signin', {title: '登陆', username: lastUser, error: err});
    }
    else
        res.render('signin', {title: '登陆'});
});

router.post('/signin', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    userManager.findUser(username, password).then(function(user) {
        req.session.user = user;
        res.redirect(301, '/?username=' + req.session.user.username);
    }, function(err) {
        req.session.err = '错误的用户名或者密码';
        req.lastUser = username;
        redirect(301, '/signin');
    })
});

router.post('/api/validate-unique', function(req, res) {
    // db.userlist.find({}, function(err, users) {
        var users = {}; //temporary
        var userlist = {};
        //turn array into dic with key of username
        for (var key in users) {
            userlist[users[key].username] = users[key];
        }
        api.validateUnique(userlist,req,res);
    // });
 
});

router.get('/', function(req, res) {
    console.log(req.session);
    var username = req.query.username;
    try {

    var err = req.session.err;
    delete req.session.err;
    if (username == req.session.user.username)
        res.render('detail', {user: req.session.user, error: err});
    else {
        req.session.err = '只能够访问自己的数据';
        res.redirect(301, '/?username='+ req.session.user.username);
    }
    } catch (err) {
        res.redirect(301, '/signin');
    }

});
}


function checkUser(user) {
  var errorMessages = [];
  //temporary ... get from database
  for(var key in user) {
    if (!validator.isFieldValid(key, user[key])) errorMessages.push(validator.form[key].errorMessage);
    if (!validator.isAttrValueUnique(users, user, key)) errorMessages.push(
      "key: " + key + " is not unique by value: " + user[key]
    );
  }
  if (errorMessages.length > 0) throw new Error(errorMessages.join('<br />'));
}

function is_user_login(req) {
    return !!req.session.user;
}



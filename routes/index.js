'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index.js')

module.exports = function makeRouterWithSockets(io) {

  // a reusable function
  function respondWithAllTweets(req, res, next) {
    client.query('SELECT name, content, tweets.id FROM tweets JOIN users on user_id= users.id', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });

    // var allTheTweets = tweetBank.list();
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: allTheTweets,
    //   showForm: true
    // });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function (req, res, next) {
    var username = req.params.username;
    client.query('SELECT name, content, tweets.id FROM tweets JOIN users on user_id= users.id WHERE name=$1', [username], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweetsForName = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsForName,
        showForm: true,
        username: req.params.username
      });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function (req, res, next) {
    var tweetId = req.params.id;
    client.query('SELECT name, content, tweets.id FROM tweets JOIN users on user_id= users.id WHERE tweets.id=$1', [tweetId], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweetsWithThatId = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsWithThatId // an array of only one element ;-)
      });
    });
  });

  // create a new tweet
  router.post('/tweets', function (req, res, next) {
    var name = req.body.name;
    var text = req.body.text;
    var newTweet= text;
    client.query('SELECT name, id FROM users WHERE name= $1', [name], function (err, result) {
      if (err) return next(err);
      if (result.rows.length) {
        var userId = result.rows[0].id;
        client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [userId, text], function (err, result) {
          if (err) return next(err);
          io.sockets.emit('new_tweet', newTweet);
          res.redirect('/');

        })
      } else {
        client.query('INSERT INTO users (name, picture_url) VALUES ($1, $2)', [name, "https://pbs.twimg.com/profile_images/2450268678/olxp11gnt09no2y2wpsh_normal.jpeg"], function (err, result) {
          if (err) return next(err);
          client.query('SELECT id FROM users WHERE name=$1', [name], function (err, result) {
            if (err) return next(err);
            var userId = result.rows[0].id;
            client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [userId, text], function (err, result) {
              if (err) return next(err);
              io.sockets.emit('new_tweet', newTweet);
              res.redirect('/');
            })
          })
        })
      }

    });
  });
  

  //client.query('INSERT INTO tweets (userId, content) VALUES ($1, $2)', [10, 'I love SQL!'], function (err, data) {/** ... */});

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  // client.query('SELECT * FROM tweets', function (err, result) {
  //   if (err) return next(err); // pass errors to Express
  //   var tweets = result.rows;
  //   res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
  // });


  return router;
}
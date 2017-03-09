let express = require('express');
let router = express.Router();

let mongo = require('mongodb');
let db = require('monk')('localhost/nodeblog');

// Homepage blog posts
router.get('/', function (req, res, next) {
    //let db = req.db;
    let posts = db.get('posts');
    posts.find({}, {}, function (err, posts) {
        res.render('index', {'posts': posts})
    });
});

module.exports = router;

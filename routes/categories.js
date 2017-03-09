let express = require('express');
let router = express.Router();

let mongo = require('mongodb');
let db = require('monk')('localhost/nodeblog');

router.get('/show/:category', function (req, res, next) {
    let db = req.db;
    let posts = db.get('posts');
    posts.find({category: req.params.category}, {}, function (err, posts) {
        res.render('index', {
            'title': req.params.category,
            'posts': posts
        });
    });
});

router.get('/add', function (req, res, next) {
    res.render('addcategory', {'title': 'Add Category'});
});

router.post('/add', function (req, res, next) {
    // Get form values
    let title = req.body.title;

    // Form validation
    req.checkBody('title', 'Title field is required').notEmpty();

    // Check errors
    let errors = req.validationErrors();
    if (errors) {
        res.render('addcategory', {
            errors: errors,
            title: title
        });
    } else {
        let categories = db.get('categories');

        // Submit to DB
        categories.insert({
            'title': title,
        }, function (err, post) {
            if (err) {
                res.send('There was an issue submitting the category')
            } else {
                req.flash('success', 'Category Submitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

module.exports = router;

let express = require('express');
let router = express.Router();

let mongo = require('mongodb');
let db = require('monk')('localhost/nodeblog');

router.get('/show/:id', function (req, res, next) {
    let posts = db.get('posts');
    posts.findById(req.params.id, function (err, post) {
        res.render('show', {
            'title': post.title,
            'post': post
        });
    });
});

router.get('/add', function (req, res, next) {
    let categories = db.get('categories');

    categories.find({}, {}, function (err, categories) {
        res.render('addpost', {
            'title': 'Add Post',
            'categories': categories
        });
    });

});

router.post('/add', function (req, res, next) {
    // Get form values
    let title = req.body.title;
    let category = req.body.category;
    let body = req.body.body;
    let author = req.body.author;
    let date = new Date();

    let imageName;

    if (req.file) {
        //imageOriginalName = req.file.originalname;
        imageName = req.file.filename;
        //imageMime = req.file.mimetype;
        //imagePath = req.file.path;
        //imageSize = req.file.size;
    } else {
        imageName = 'noimage.png';
    }

    // Form validation
    req.checkBody('title', 'Title field is required').notEmpty();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check errors
    let errors = req.validationErrors();
    if (errors) {
        res.render('addpost', {
            errors: errors,
            title: title,
            body: body
        })
    } else {
        let posts = db.get('posts');

        // Submit to DB
        posts.insert({
            'title': title,
            'category': category,
            'body': body,
            'date': date,
            'author': author,
            'mainimage': imageName
        }, function (err, post) {
            if (err) {
                res.send('There was an issue submiting the post')
            } else {
                req.flash('success', 'Post Submitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

router.post('/addcomment', function (req, res, next) {
    // Get form values
    let postid = req.body.postid;
    let name = req.body.name;
    let email = req.body.email;
    let body = req.body.body;
    let date = new Date();

    // Form validation
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email is not formated correctly').isEmail();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check errors
    let errors = req.validationErrors();
    if (errors) {
        let posts = db.get('posts');
        posts.findById(postid, function (err, post) {
            res.render('show', {
                errors: errors,
                post: post
            });
        });
    } else {
        let comment = {
            'name': name,
            'email': email,
            'body': body,
            'date': date
        };

        let posts = db.get('posts');

        posts.update({
                '_id': postid,
            },
            {
                $push: {'comments': comment}
            },
            function (err, doc) {
                if (err) {
                    throw err;
                } else {
                    req.flash('success', 'Comment Added');
                    res.location('/posts/show/' + postid);
                    res.redirect('/posts/show/' + postid);
                }
            });
    }
});

module.exports = router;

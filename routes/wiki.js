var express = require('express');
var router = express.Router();
var models = require('../models');
var Page = models.Page;
var User = models.User;
module.exports = router;

// /wiki
router.get('/', function (req, res, next) {

    Page.findAll({})
        .then(function (pages) {
            res.render('index', {pages: pages});
        })
        .catch(next);

});

// /wiki
router.post('/', function (req, res, next) {

    User.findOrCreate({
            where: {
                name: req.body.name,
                email: req.body.email
            }
        })
        .spread(function (user, createdPageBool) {
            return Page.create(req.body)
                .then(function (page) {
                    return page.setAuthor(user);
                });
        })
        .then(function (page) {
            res.redirect(page.route);
        })
        .catch(next);

});

router.get('/search', function (req, res, next) {

    Page.findByTag(req.query.search)
        .then(function (pages) {
            res.render('index', {
                pages: pages
            });
        })
        .catch(next);

});

router.post('/:urlTitle', function (req, res, next) {

    Page.update(req.body, {
            where: {
                urlTitle: req.params.urlTitle
            },
            returning: true
        })
        .spread(function (updatedRowCount, updatedPages) { //all updated pages are returned. We will only be looking at one of them
            res.redirect(updatedPages[0].route);
            //alternatively we could do a findAll after the update instead of using `returning` keyword
        })
        .catch(next);

});

router.get('/:urlTitle/delete', function (req, res, next) {

    Page.destroy({
            where: {
                urlTitle: req.params.urlTitle
            }
        })
        .then(function () {
            res.redirect('/wiki');
        })
        .catch(next);

});

// /wiki/add
router.get('/add', function (req, res) {
    res.render('addpage');
});

function generateError (message, status) {
    let err = new Error(message);
    err.status = status;
    return err;
}

// /wiki/(dynamic value)
router.get('/:urlTitle', function (req, res, next) {

    Page.findOne({
            where: {
                urlTitle: req.params.urlTitle
            },
            include: [
                {model: User, as: 'author'}
            ]
        })
        .then(function (page) {
            if (page === null) {
                throw generateError('No page found with this title', 404);
            } else {
                res.render('wikipage', {
                    page: page
                });

            }
        })
        .catch(next);

});

router.get('/:urlTitle/edit', function (req, res, next) {

    Page.findOne({
            where: {
                urlTitle: req.params.urlTitle
            },
            include: [
                {model: User, as: 'author'}
            ]
        })
        .then(function (page) {
            if (page === null) {
                //to show you sendStatus in contrast to using the error handling middleware above
                res.sendStatus(404);
            } else {
                res.render('editpage', {
                    page: page
                });
            }
        })
        .catch(next);


});

// /wiki/(dynamic value)
router.get('/:urlTitle/similar', function (req, res, next) {

    Page.findOne({
            where: {
                urlTitle: req.params.urlTitle
            }
        })
        .then(function (page) {
            if (page === null) {
                throw generateError('No pages correspond to this title', 404);
            } else {
                return page.findSimilar()
                    .then(function (pages) {
                        res.render('index', {
                            pages: pages
                        });
                    });
            }
        })
        .catch(next);

});

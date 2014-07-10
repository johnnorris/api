var sessionManager = require("./sessionManagement");

module.exports = function(app, express) {
    app.get("/signup", function(req, res) {
        res.render('signup');
    });

    app.get("/dashboard", sessionManager.requiresSession, function(req, res) {
        var streamId = req.query.streamId ? req.query.streamId : "";
        var readToken = req.query.readToken ? req.query.readToken : "";

        res.render('dashboard', {
            streamId: streamId,
            readToken: readToken
        });
    });

    app.get("/claimUsername", function(req, res) {
        res.render('claimUsername', {
            username: req.query.username,
            githubUsername: req.query.username
        });
    });

    app.post("/claimUsername", function(req, res) {
        var oneselfUsername = req.body.username;
        var githubUsername = req.body.githubUsername;

        var byOneselfUsername = {
            "username": oneselfUsername
        };

        qdDb.collection('users').findOne(byOneselfUsername, function(err, user) {
            if (user) {
                res.render('claimUsername', {
                    username: oneselfUsername,
                    githubUsername: githubUsername,
                    error: "Username already taken. Please choose another one."
                });
            } else {
                var byGithubUsername = {
                    "githubUser.username": githubUsername
                };
                qdDb.collection('users').update(byGithubUsername, {
                    $set: {
                        username: oneselfUsername
                    }
                }, function(err, user) {
                    if (err) {
                        res.status(500).send("Database error");
                    } else {
                        req.session.username = oneselfUsername;
                        res.redirect('/dashboard?username=' + oneselfUsername);
                    }
                });
            }
        });
    });

    app.get("/compare", sessionManager.requiresSession, function(req, res) {
        res.render('compare');
    });

    app.get("/community", function(req, res) {
        res.render('community', getFilterValuesFrom(req));
    });
}
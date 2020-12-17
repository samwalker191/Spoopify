const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const secretOrKey = require('../../config/keys').secretOrKey;

// sign up
router.post("/", (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                return res.status(422).json({ email: 'Email has already been taken'});
            } else {
                const newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.passwordDigest = hash;
                        
                        newUser.save()
                            .then(user => {
                                const payload = {
                                    id: user.id,
                                    username: user.username,
                                    email: user.email
                                };

                                jwt.sign(
                                    payload,
                                    secretOrKey,
                                    // Tell the key to expire in one hour
                                    { expiresIn: 3600 },
                                    (err, token) => {
                                        res.json({
                                            success: true,
                                            token: 'Bearer ' + token
                                        });
                                    }
                                );
                            })
                            .catch(err => console.log(err));

                            
                    })
                })
            }
        })
})

// login
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ email: 'This user does not exist' });
            }

            bcrypt.compare(password, user.passwordDigest)
                .then(isMatch => {
                    if (isMatch) {
                        const payload = { 
                            id: user.id, 
                            username: user.username,
                            email: user.email
                        };

                        jwt.sign(
                            payload,
                            secretOrKey,
                            // Tell the key to expire in one hour
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            });
                    } else {
                        return res.status(400).json({ password: 'Incorrect password' });
                    }
                })
        })
})

// get current user
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
    });
})

module.exports = router;
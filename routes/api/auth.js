const express = require("express")
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken'); // JSON web token is used to authenticate a user
const config = require('config')
const {
    check,
    validationResult
} = require('express-validator/check');
const User = require('../../models/User')


// @route   GET api/auth
// @desc    auth route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // When an authorized token is sent, find a user id and remove password from the result
        res.json(user); // Send the user data to the result
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}); // remember to add auth as a second parameter to use middleware authorization

// @route   POST api/auth   
// @desc    Authenticate session user and get session token
// @access  Public
router.post('/', [ // Create a user
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => { // Check if there are any errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { // De-construction of JSON payload -> ES6
        email,
        password
    } = req.body;

    try {
        // See if user exists already
        let user = await User.findOne({ // Get a user with matching email
            email: email
        });

        if (!user) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid Credentials'
                }]
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid Credentials'
                }]
            });
        }

        // Return jsonwebtoken 
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, config.get('jwtSecret'), {
                expiresIn: 360000, // Change this to 3600 in production
            },
            (err, token) => {
                if (err) throw err;
                res.json({ // If no errors, send the jwt to the user -> large string of letters and numbers that is unique to each user. Will be used to identify a specific user
                    token
                });
            })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error'); // Any errors caught will definitely be a server error
    }

});

module.exports = router;
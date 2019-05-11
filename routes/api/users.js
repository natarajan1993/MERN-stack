const express = require("express")
const {
    check,
    validationResult
} = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken'); // JSON web token is used to authenticate a user
const config = require('config')
const User = require('../../models/User')

// @route   POST api/auth   
// @desc    Register user
// @access  Public
router.post('/', [ // Create a user
    check('name', 'Name is required').not().isEmpty(), //Express validator for checking if name field is not empty
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    })
], async (req, res) => { // Check if there are any errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { // De-construction of JSON payload -> ES6
        name,
        email,
        password
    } = req.body;

    try {
        // See if user exists already
        let user = await User.findOne({
            email: email
        });

        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'User already exists'
                }]
            });
        }

        // Get the users gravatar
        const avatar = gravatar.url(email, {
            s: '200', // default size
            r: 'pg', // PG rated pics
            d: 'mm' // Sets a default image
        });

        user = new User({
            name,
            email,
            avatar,
            password
        })

        // Encrypt password
        const salt = await bcrypt.genSalt(10); // Generate a salt for the password
        user.password = await bcrypt.hash(password, salt); // Generate hash for the user with the salt
        await user.save();
        /* Use await-async as opposed to .then() which will have commands nested inside levels of then() calls. await async makes it look cleaner */


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
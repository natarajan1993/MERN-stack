const express = require("express")
const {
    check,
    validationResult
} = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../../models/User')

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(), //Express validator for checking if name field is not empty
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
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
        res.send('User Registered')
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error'); // Any errors caught will definitely be a server error
    }

});

module.exports = router;
const express = require("express")
const router = express.Router();
const auth = require('../../middleware/auth')
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

module.exports = router;
const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    // Get the token from the header
    const token = req.header('x-auth-token');

    if (!token) { // If there is no token send an 401 unauthorised status code
        return res.status(401).json({
            msg: 'No token. Authorization is denied'
        });
    }
    try { // If token exists, verify if it's the actual token
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user; // JWT has user attached to it. So set the decoded user as the session's user. Can be used in all imports of middleware
        next();
    } catch (err) {
        res.status(401).json({
            msg: 'Token is not valid'
        });
    }
};
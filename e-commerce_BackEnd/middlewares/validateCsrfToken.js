const { csrfTokens } = require('../index'); // Adjust the path as needed

function validateCsrfToken(req, res, next) {
    const receivedCsrfToken = req.body.csrfToken; // Get CSRF token from request body
    if (!csrfTokens[receivedCsrfToken]) {
        return res.status(403).send('Invalid CSRF token'); // Token doesn't exist
    }
    
    delete csrfTokens[receivedCsrfToken];

    next(); // Proceed to the next middleware
}

module.exports = validateCsrfToken;

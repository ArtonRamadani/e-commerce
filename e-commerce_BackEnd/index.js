// Load environment variables from a .env file
require('dotenv').config();

// Importing necessary modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

// Middleware to parse incoming request bodies in JSON format
app.use(bodyParser.json({ extended: true }));
 
// Middleware to serve static files from the '/uploads' directory
app.use('/uploads', express.static(process.cwd() + '/uploads'));

// Middleware to handle requests to '/servertest' path to check if the server is up and running
app.use('/servertest', (req, res) => {
    const htmlResponse = '<!DOCTYPE html><html><head></head><body>e-commerce server is up and running!</body></html>';
    res.send(htmlResponse);
});

// ///////////////////////////////////////////////////////// //
// Define a whitelist of allowed origins for CORS
const whitelist = [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://localhost:3001',
];

// CORS options configuration
var corsOptions = {
    origin: async function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('You do not have access here!'));
        }
    }
};
// Enable CORS with the configured options
// app.use(cors(corsOptions));
app.use(cors());

// This function is used to only return a string You do not have access here! is the users domain is not in the whitelist
app.use(function (err, req, res, next) {
    if (err && err.message === 'You do not have access here!') {
        res.status(403).send(err.message);
    } else {
        next(err);
    }
});
// //////////////////////////////////////////////////////// //
// //////////////////////////////////////////////////////// //

app.use(cookieParser());

let csrfTokens = {}

// Initialize CSRF protection middleware
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Middleware to attach CSRF token to response locals
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken(); // Attach CSRF token to response locals
    next();
});

// Route to generate and send CSRF token to the client
app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: res.locals.csrfToken }); // Send CSRF token to the client
});

// //////////////////////////////////////////////////////// //
// //////////////////////////////////////////////////////// //


// Define all routes for authentication and other routs here bellow
app.use('/api/login', require('./routes/auth/login'));
app.use('/api/signup', require('./routes/auth/signup'));



// THIS FUNCTION FETCHES THE CONNECTION STRING TO THE DATABASE. 
// AFTER ALL THE ROUTES ARE DECLARED FROM HERE ON UP, EACH OF THOSE FILES REQUIRES A MODEL. 
// IT CHECKS IF THAT MODEL EXISTS IN THE DATABASE.
// IF IT DOESN'T, THEN IT SYNCHRONIZES IT. 
// THIS IMPLEMENTS CODE-FIRST DATABASE DEVELOPMENT.

const db = require('./config/db');
async function syncDatabase() {
    try {
        await db.sync();
        console.log('Database synchronized');
    } catch (error) {
        console.error('Error synchronizing database:', error);
    }
}
syncDatabase();
// ////////////////////////////////////////////////////////////// //


// Start the server and listen for incoming connections on the specified port
app.listen(process.env.PORT, () => {
    console.log(`E-Sim server is running on port ${process.env.PORT}`);
});
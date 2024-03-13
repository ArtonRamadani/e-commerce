const express = require('express');
const Users = require('../../models/users');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const csrf = require('csurf');
const { Op } = require('sequelize');
// const validateCsrfToken = require('../../middlewares/validateCsrfToken');

// CSRF protection middleware 
const csrfProtection = csrf({ cookie: true });


// Function to validate if a user with the provided email or username exists
async function validateUserExist(email, username) {
    const userData = await Users.findOne({
        where: {
            [Op.or]: [
                { email: email, is_deleted: false },
                { username: username, is_deleted: false }
            ]
        }
    });

    const emailExists = userData && userData.email === email;
    const usernameExists = userData && userData.username === username;

    return {
        emailExists,
        usernameExists
    };
}

// Route to handle user signup
router.post('/', csrfProtection, async (req, res) => {
    try {
        // Check if email and username are provided
        if (!req.body.email || !req.body.username) {
            return res.status(400).json("Please provide a valid email and username!");
        }

        // Destructure request body for ease of use
        const { email, username, password } = req.body;

        // Validate if email and username already exist
        const { emailExists, usernameExists } = await validateUserExist(email, username);

        // If email or username already exist, return error
        if (emailExists) {
            return res.status(403).json(`A user with email: ${email} already exists!`);
        } else if (usernameExists) {
            return res.status(403).json(`A user with username: ${username} already exists!`);
        }

        // Extract secret key for JWT from environment
        const secret = process.env.SECRET_KEY;

        // Decode JWT password
        const pasDecodeJwt = jwt.decode(password, secret);

        // Retrieve salt rounds for bcrypt hashing from environment
        const saltRounds = process.env.SALTROUNDS;

        // Hash the decoded password with bcrypt
        bcrypt.hash(String(pasDecodeJwt), Number(saltRounds), async function (err, hash) {
            if (err) {
                return res.status(500).json('Error hashing password');
            }

            // Create a new user with hashed password
            const newUser = new Users({
                // role should not be sent from front end, since a user can send a "duumy data" with the role of lets say SuperAdmin and he can create as many SA as he wants which is not good !!
                role_id: req.body.role_id,
                name: req.body.name,
                surname: req.body.surname,
                username: username,
                email: email,
                password: hash,
                auth: 'authSoon',
                phone_number: req.body.phone_number,
                gender: req.body.gender,
                is_active: 1,
                is_deleted: 0,
            });

            // Save the new user to the database
            try {
                await newUser.save();
                return res.status(200).json({
                    message: "New user created!",
                    newUserData: {
                        id: newUser.id,
                        first_name: newUser.first_name,
                        last_name: newUser.last_name,
                        email: newUser.email,
                        username: newUser.username,
                        // password: "encrypted", 
                        // no need to return password since it is encrypted and the encription should not be sent to the user since it could be a potential security risk
                        auth: newUser.auth,
                        phone_number: newUser.phone_number,
                        gender: newUser.gender,
                        is_active: newUser.is_active,
                        is_deleted: newUser.is_deleted,
                        created_at: newUser.created_at,
                    }
                });
            } catch (err) {
                return res.status(400).json('Error creating user: ' + err);
            }
        });
    } catch (err) {
        return res.status(400).json({ "catch": err.message });
    }
});

module.exports = router;

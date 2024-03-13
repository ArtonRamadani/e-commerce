const express = require('express');
const Users = require('../../models/users');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const { Op } = require('sequelize');
const csrf = require('csurf');

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

router.post('/', csrfProtection, async (req, res, next) => {
    const { email, username, password } = req.body;
    const secretKey = process.env.SECRET_KEY;
    if (!email || !password) {
        return res.status(401).json({ error: 'All fields must be filled' });
    }
    try {
        let user;
        if (email || username) {
            user = await Users.findOne({
                where: {
                    [Op.or]: [
                        { email: email },
                        { username: email },
                    ],
                    is_deleted: 0
                },
            });
        }
        if (user === null) {
            return res.status(401).json({ error: 'User does not exist!' });
        } else if (user.is_active !== 1) {
            return res.status(200).json({ error: 'User has been deactivated!' });
        }

        const decodedPassword = jwtDecode(password, secretKey);


        bcrypt.compare(String(decodedPassword), String(user.password), async function (err, isMatch) {
            if (isMatch) {
                const token = jwt.sign(
                    {
                        uuid: user?.uuid,
                        user_id: user?.id,
                        role: user?.role_id,
                        salon_id: user?.salon_id,
                        logout_timer: new Date()
                    },
                    secretKey
                );
                const auth = jwt.sign(
                    {
                        user_id: user?.id,
                        role: user?.role_id,
                        salon_id: user?.salon_id,
                    },
                    secretKey
                );

                await Users.update({ auth: auth }, { where: { id: user.id } });
                return res.status(200).json({ token: token });
            } else {
                return res.status(401).json({ error: 'Password is incorrect!' });
            }
        });
    } catch (err) {
        return res.status(400).json('Error: ' + err);
    }
});

module.exports = router;

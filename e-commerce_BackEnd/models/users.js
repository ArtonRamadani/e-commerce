const { Sequelize, DataTypes, literal } = require('sequelize');
const db = require('../config/db');

const users = db.define('users', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    role_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    surname: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    auth: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone_number: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    gender: {
        type: DataTypes.INTEGER(),
        allowNull: true
    },
    pic_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    is_active: {
        type: DataTypes.INTEGER(1),
        defaultValue: 1,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE(),
        defaultValue: literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE(),
        allowNull: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN(),
        defaultValue: false,
        allowNull: true
    },
}, {
   
    timestamps: false,
    scopes: {
        withoutPassword: {
            attributes: { exclude: ['password'] },
        }
    }
});

module.exports = users;

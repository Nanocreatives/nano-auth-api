const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment-timezone');

const config = require('../../../config/config');

/**
 * Refresh Token Schema
 * @private
 */
const refreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userEmail: {
            type: 'String',
            required: true
        },
        expires: { type: Date }
    },
    {
        timestamps: true
    }
);

refreshTokenSchema.statics = {
    /**
     * Generate a refresh token object and saves it into the database
     *
     * @param {User} user
     * @returns {RefreshToken}
     */
    generate(user) {
        const userId = user._id;
        const userEmail = user.email;
        const userCountry = user.country;
        const token = `${Date.now()}.${crypto.randomBytes(40).toString('hex')}`;
        const expires = moment().add(config.auth.refreshTokenValidity, 'seconds').toDate();
        const tokenObject = new RefreshToken({
            token,
            userId,
            userEmail,
            expires,
            userCountry
        });
        tokenObject.save();
        return tokenObject;
    }
};

/**
 * @typedef RefreshToken
 */
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;

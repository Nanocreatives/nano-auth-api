const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment-timezone');

/**
 * Password Refresh Token Schema
 * @private
 */
const passwordResetTokenSchema = new mongoose.Schema(
    {
        resetToken: {
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

passwordResetTokenSchema.statics = {
    /**
     * Generate a reset token object and saves it into the database
     *
     * @param {User} user
     * @returns {ResetToken}
     */
    async generate(user) {
        const userId = user._id;
        const userEmail = user.email;
        const resetToken = `${Date.now()}.${crypto.randomBytes(40).toString('hex')}`;
        const expires = moment().add(2, 'hours').toDate();
        const ResetTokenObject = new AuthPasswordResetTokenModel({
            resetToken,
            userId,
            userEmail,
            expires
        });
        await ResetTokenObject.save();
        return ResetTokenObject;
    }
};

/**
 * @typedef RefreshToken
 */
const AuthPasswordResetTokenModel = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
module.exports = AuthPasswordResetTokenModel;

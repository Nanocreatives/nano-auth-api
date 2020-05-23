const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Account Verification Token Schema
 * @private
 */
const accountVerificationTokenSchema = new mongoose.Schema({
    verificationToken: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userEmail: {
        type: 'String',
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        expires: '5d',
        default: Date.now
    },
}, {
    timestamps: true
});

accountVerificationTokenSchema.statics = {
    /**
     * Generate a verification token object and saves it into the database
     *
     * @param {User} user
     * @returns {VerificationToken}
     */
    async generate(user) {
        const userId = user._id;
        const userEmail = user.email;
        const verificationToken = `${Date.now()}.${crypto.randomBytes(40).toString('hex')}`;
        const verificationTokenObject = new AccountVerificationTokenModel({
            verificationToken,
            userId,
            userEmail,
        });
        await verificationTokenObject.save();
        return verificationTokenObject;
    },
};

/**
 * @typedef AccountVerificationToken
 */
const AccountVerificationTokenModel = mongoose.model('AccountVerificationToken', accountVerificationTokenSchema);
module.exports = AccountVerificationTokenModel;
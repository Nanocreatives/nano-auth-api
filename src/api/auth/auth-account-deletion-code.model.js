const mongoose = require('mongoose');

/**
 * Account Deletion Code Schema
 * @private
 */
const accountDeletionCodeModel = new mongoose.Schema({
    code: {
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
        expires: '10m',
        default: Date.now
    },
}, {
    timestamps: true
});

accountDeletionCodeModel.statics = {
    /**
     * Generate a deletion code object and saves it into the database
     *
     * @param {User} user
     * @returns {DeletionCode}
     */
    async generate(user) {
        const userId = user._id;
        const userEmail = user.email;
        const code = Math.floor(Math.random() * (999999 - 100000) ) + 100000;
        const deletionCodeObject = new AccountDeletionCodeModel({
            code,
            userId,
            userEmail,
        });
        await deletionCodeObject.save();
        return deletionCodeObject;
    },
};

/**
 * @typedef AccountDeletionCode
 */
const AccountDeletionCodeModel = mongoose.model('AccountDeletionCode', accountDeletionCodeModel);
module.exports = AccountDeletionCodeModel;
const httpStatus = require('http-status');
const { omit, pickBy } = require('lodash');

const User = require('./user.model');
const logger = require('../../config/logger');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
    try {
        const user = await User.get(id);
        req.locals = { ...req.locals, loadedUser: user };
        return next();
    } catch (error) {
        logger.error('An error occurred during the load of the user', error);
        return next();
    }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.loadedUser.transform());

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = (req, res) => res.json(req.locals.user.transform());

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(httpStatus.CREATED);
        res.json(savedUser.transform());
    } catch (error) {
        next(User.checkDuplicateEmail(error));
    }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req, res, next) => {
    try {
        const { loadedUser, user } = req.locals;
        const newUser = new User(req.body);
        const ommitRole = user.role !== 'admin' ? 'role' : '';
        const newUserObject = omit(newUser.toObject(), '_id', ommitRole);
        await loadedUser.replaceOne(newUserObject);
        const savedUser = await User.findById(loadedUser._id);

        res.json(savedUser.transform());
    } catch (error) {
        next(User.checkDuplicateEmail(error));
    }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req, res, next) => {
    const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
    const updatedUser = omit(req.body, ommitRole);
    const user = Object.assign(req.locals.loadedUser, updatedUser);

    user.save()
        .then((savedUser) => res.json(savedUser.transform()))
        .catch((e) => next(User.checkDuplicateEmail(e)));
};

/**
 * Update existing user profile information
 * @public
 */
exports.updateUserProfile = (req, res, next) => {
    const { firstname, lastname, phone, country, birthdate } = req.body;
    const dataToUpdate = pickBy(
        {
            firstname,
            lastname,
            phone,
            country,
            birthdate
        },
        (value) => value !== undefined
    );
    const user = Object.assign(req.locals.user, dataToUpdate);
    user.save()
        .then((savedUser) => res.json(savedUser.transform()))
        .catch((e) => next(User.checkDuplicateEmail(e)));
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
    try {
        const users = await User.list(req.query);
        const transformedUsers = users.map((user) => user.transform());
        res.json(transformedUsers);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
    const { loadedUser } = req.locals;

    loadedUser
        .remove()
        .then(() => res.status(httpStatus.NO_CONTENT).end())
        .catch((e) => next(e));
};

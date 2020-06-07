const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');

const APIError = require('../../utils/APIError');
const config = require('../../config/config');
const Errors = require('../../utils/auth.errors');

/**
 * User Roles
 */
const roles = ['user', 'admin', 'super-admin'];

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128
    },
    lastname: {
      type: String,
      maxlength: 128,
      index: true,
      trim: true
    },
    firstname: {
      type: String,
      maxlength: 128,
      index: true,
      trim: true
    },
    phone: {
      type: String,
      maxlength: 20,
      index: true,
      trim: true
    },
    providers: {
      facebook: String,
      google: String
    },
    role: {
      type: String,
      enum: roles,
      default: 'user'
    },
    verified: {
      type: Boolean,
      default: false
    },
    locked: {
      type: Boolean,
      default: false
    },
    lockedAt: {
      type: Date
    },
    lockedUntil: {
      type: Date
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    },
    lastLoginDate: {
      type: [Date]
    },
    lastLoginAttempts: {
      type: [Date]
    },
    lastPasswords: {
      type: [String]
    },
    organizations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
      }
    ],
    picture: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.pre('remove', async function save(next) {
  try {
    this.model('AccountDeletionCode').remove({ userId: this._id }).exec();
    this.model('AccountVerificationToken').remove({ userId: this._id }).exec();
    this.model('RefreshToken').remove({ userId: this._id }).exec();
    this.model('PasswordResetToken').remove({ userId: this._id }).exec();
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'lastname',
      'firstname',
      'email',
      'picture',
      'role',
      'verified',
      'createdAt'
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const payload = {
      exp: moment().add(config.auth.accessTokenValidity, 'seconds').toDate(),
      iat: moment().toDate(),
      sub: this._id
    };
    return jwt.encode(payload, config.auth.jwtSecret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  }
});

/**
 * Statics
 */
userSchema.statics = {
  roles,

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    let user;

    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await this.findById(id).exec();
    }
    if (user) {
      return user;
    }

    throw new APIError(Errors.NOT_FOUND);
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email) throw new APIError({ message: 'An email is required to generate a token' });

    const user = await this.findOne({ email }).exec();

    if (!user) throw new APIError(Errors.INVALID_CREDENTIAL);

    let credentialValid = false;
    if (password) {
      if (await user.passwordMatches(password)) {
        credentialValid = true;
      }
    } else if (refreshObject && refreshObject.userEmail === email) {
      if (moment(refreshObject.expires).isAfter()) {
        credentialValid = true;
      }
    }
    if (credentialValid) {
      if (!user.verified) {
        throw new APIError(Errors.ACCOUNT_UNVERIFIED);
      } else if (user.locked && moment().isBefore(user.lockedUntil)) {
        throw new APIError(Errors.ACCOUNT_LOCKED);
      } else if (user.mustChangePassword) {
        throw new APIError(Errors.MUST_CHANGE_PASSWORD);
      } else {
        if (user.locked && moment().isAfter(user.lockedUntil)) {
          user.locked = false;
          user.lockedUntil = null;
          user.lockedAt = null;
        }
        user.lastLoginDate.unshift(Date.now());
        user.lastLoginDate = user.lastLoginDate.slice(0, 5);
        user.lastLoginAttempts = [];
        user.save();
        return { user, accessToken: user.token() };
      }
    } else if (password) {
      if (user.locked && moment().isBefore(user.lockedUntil)) {
        throw new APIError(Errors.ACCOUNT_LOCKED);
      } else {
        if (user.locked && moment().isAfter(user.lockedUntil)) {
          user.locked = false;
          user.lockedUntil = null;
          user.lockedAt = null;
          user.lastLoginAttempts = [];
        }
        user.lastLoginAttempts.unshift(Date.now());
        if (user.lastLoginAttempts.length >= config.auth.maxLoginAttempt) {
          user.locked = true;
          user.lockedUntil = moment().add(config.auth.lockDelay, 'hours').toDate();
          user.lockedAt = Date.now();
          user.save();
          throw new APIError(Errors.ACCOUNT_LOCKED_ON_FAILED_ATTEMPT);
        } else if (user.lastLoginAttempts.length + 1 === config.auth.maxLoginAttempt) {
          user.save();
          throw new APIError(Errors.LOCKED_ON_NEXT_FAILED_ATTEMPT);
        } else {
          user.save();
        }
      }
    }
    throw new APIError(Errors.INVALID_CREDENTIAL);
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ page = 1, perPage = 30, name, email, role }) {
    const options = omitBy({ name, email, role }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [
          {
            field: 'email',
            location: 'body',
            messages: ['"email" already exists']
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
      });
    }
    return error;
  },

  async oAuthLogin({ provider, id, email, lastname, firstname, picture }) {
    const user = await this.findOne({ $or: [{ [`providers.${provider}`]: id }, { email }] });
    if (user) {
      user.providers[provider] = id;
      if (!user.lastname) user.lastname = lastname;
      if (!user.firstname) user.firstname = firstname;
      if (!user.picture) user.picture = picture;
      return user.save();
    }
    const password = crypto.randomBytes(16).toString('hex');
    return this.create({
      providers: { [provider]: id },
      email,
      password,
      firstname,
      lastname,
      picture
    });
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);

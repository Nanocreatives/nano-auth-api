const express = require('express');

const idRoutes = require('./id/auth.id.route');
const passwordRoutes = require('./password/auth.password.route');
const registerRoutes = require('./register/auth.register.route');
const signinRoutes = require('./signin/auth.signin.route');
const terminateRoutes = require('./terminate/auth.terminate.route');

const router = express.Router();

router.use('/', signinRoutes);
router.use('/register', registerRoutes);
router.use('/password', passwordRoutes);
router.use('/id', idRoutes);
router.use('/terminate', terminateRoutes);

module.exports = router;

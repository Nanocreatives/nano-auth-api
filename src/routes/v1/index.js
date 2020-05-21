const express = require('express');

const config = require('../../config/config')
const authRoutes = require('../../api/auth/auth.route');
const userRoutes = require('../../api/user/user.route');

const router = express.Router();

/**
 * GET v1 API documentation
 */
router.use('/docs', express.static('docs'));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

/**
 *  Health Check
 */
router.get('/health-check', (req, res) => res.send({
    version : config.version,
    status : 'OK'
}));

module.exports = router;
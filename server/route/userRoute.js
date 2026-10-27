const express = require('express');
const router = express.Router();
const { register, login, getUsers, getPartners } = require('../Controller/userController');

router.post('/register', register);
router.post('/login', login);
router.get('/customers', getUsers);
router.get('/partners', getPartners);

module.exports = router;

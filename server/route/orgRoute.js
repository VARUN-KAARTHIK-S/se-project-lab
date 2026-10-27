const express = require('express');
const router = express.Router();
const { createOrg, getAllOrgs, deleteOrg } = require('../Controller/orgController');

router.post('/', createOrg);
router.get('/', getAllOrgs);
router.delete('/:id', deleteOrg);

module.exports = router;

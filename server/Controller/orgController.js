const Organization = require('../Model/Organization');

exports.createOrg = async (req, res) => {
    try {
        const org = new Organization(req.body);
        await org.save();
        res.status(201).json(org);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllOrgs = async (req, res) => {
    try {
        const orgs = await Organization.find();
        res.json(orgs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteOrg = async (req, res) => {
    try {
        await Organization.findByIdAndDelete(req.params.id);
        res.json({ message: 'Organization deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

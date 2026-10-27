const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    parkingDetails: { type: String }, // Details like "Floor 1, Slot B-12" or "Basement Parking"
    capacity: { type: Number, default: 0 },
    description: { type: String },
    contactNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);

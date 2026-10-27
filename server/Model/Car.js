const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    fuelType: { type: String, required: true },
    isTBoard: { type: Boolean, default: false },
    dailyRate: { type: Number, required: true },
    kmRate: { type: Number, required: true },
    allowedKm: { type: Number, required: true },
    location: { type: String, required: true },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    status: { type: String, enum: ['Pending', 'Available', 'Rented', 'Maintenance'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);

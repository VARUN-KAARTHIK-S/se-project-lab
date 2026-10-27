const Car = require('../Model/Car');
const User = require('../Model/User');

exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find({ status: 'Available' }).populate('owner', 'name').populate('organization', 'name location');
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingCars = async (req, res) => {
    try {
        const cars = await Car.find({ status: 'Pending' }).populate('owner', 'name').populate('organization', 'name location');
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.listCar = async (req, res) => {
    try {
        const { brand, model, year, fuelType, isTBoard, dailyRate, kmRate, allowedKm, location, owner, organization } = req.body;

        let imageUrls = [];
        if (req.body.images) {
            imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        let uploadedUrls = [];
        if (req.files && req.files.length > 0) {
            uploadedUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
        }

        const carData = {
            brand,
            model,
            year: Number(year),
            fuelType,
            isTBoard: isTBoard === 'true' || isTBoard === true,
            dailyRate: Number(dailyRate),
            kmRate: Number(kmRate),
            allowedKm: Number(allowedKm),
            location,
            owner,
            organization,
            images: [...imageUrls, ...uploadedUrls],
            status: 'Pending'
        };

        const car = new Car(carData);
        const savedCar = await car.save();
        res.status(201).json(savedCar);
    } catch (error) {
        console.error("List car error:", error);
        res.status(400).json({ message: error.message });
    }
};

exports.getPartnerCars = async (req, res) => {
    try {
        const cars = await Car.find({ owner: req.params.partnerId }).populate('organization', 'name location parkingDetails');
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.approveCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndUpdate(req.params.id, { status: 'Available' }, { new: true });
        res.json(car);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteCar = async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.json({ message: 'Car removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateCar = async (req, res) => {
    try {
        const { dailyRate, kmRate, allowedKm, location, organization, status } = req.body;

        let imageUrls = [];
        if (req.body.images) {
            imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        let uploadedUrls = [];
        if (req.files && req.files.length > 0) {
            uploadedUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
        }

        const updateData = {
            dailyRate: Number(dailyRate),
            kmRate: Number(kmRate),
            allowedKm: Number(allowedKm),
            location,
            organization,
            status,
            images: [...imageUrls, ...uploadedUrls]
        };

        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('organization', 'name location parkingDetails');

        if (!updatedCar) return res.status(404).json({ message: 'Car not found' });
        res.json(updatedCar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

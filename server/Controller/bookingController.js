const Booking = require('../Model/Booking');
const Car = require('../Model/Car');

exports.createBooking = async (req, res) => {
    try {
        const { car, user, startDate, startTime, returnDate, returnTime, estimatedKm, totalFare } = req.body;

        if (!car || !user || !startDate || !startTime || !returnDate || !returnTime || !totalFare) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }

        const booking = new Booking({
            car,
            user,
            startDate,
            startTime,
            returnDate,
            returnTime,
            estimatedKm: estimatedKm || 0,
            totalFare,
            status: 'Booked'
        });

        const savedBooking = await booking.save();

        await Car.findByIdAndUpdate(car, { status: 'Rented' });

        res.status(201).json(savedBooking);
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('car', 'brand model year location images')
            .populate('user', 'name email');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId })
            .populate('car', 'brand model year location images dailyRate kmRate allowedKm');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'Completed' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        await Car.findByIdAndUpdate(booking.car, { status: 'Available' });

        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'Cancelled' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        await Car.findByIdAndUpdate(booking.car, { status: 'Available' });

        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getUserBookings,
    completeBooking,
    cancelBooking
} = require('../Controller/bookingController');

router.post('/', createBooking);
router.get('/', getAllBookings);
router.get('/user/:userId', getUserBookings);
router.put('/complete/:id', completeBooking);
router.put('/cancel/:id', cancelBooking);

module.exports = router;

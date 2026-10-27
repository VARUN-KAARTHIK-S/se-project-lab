const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllCars, getPendingCars, listCar, getPartnerCars, approveCar, deleteCar, updateCar } = require('../Controller/carController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/', getAllCars);
router.get('/pending', getPendingCars);
router.post('/list', upload.array('carImages', 10), listCar);
router.get('/partner/:partnerId', getPartnerCars);
router.put('/approve/:id', approveCar);
router.delete('/:id', deleteCar);
router.put('/:id', upload.array('carImages', 10), updateCar);

module.exports = router;

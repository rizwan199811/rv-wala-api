const express = require('express')
const router = express.Router();
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const miscRoutes = require('./routes/miscRoutes');
const rvRoutes = require('./routes/rvRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');



router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/misc', miscRoutes);
router.use('/rv', rvRoutes);
router.use('/payment', paymentRoutes);
router.use('/booking', bookingRoutes);


module.exports=router
const express = require('express')
const router = express.Router();
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const miscRoutes = require('./routes/miscRoutes');



router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/misc', miscRoutes);


module.exports=router
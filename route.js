const express = require('express')
const router = express.Router();
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');


router.use('/user', userRoutes);
router.use('/auth', authRoutes);
module.exports=router
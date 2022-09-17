const { UserModel, SeedModel } = require('../models')
const {
  jwt,
  asyncMiddleware,
  statusCodes,
} = require('../utils/index')
const cloudinary = require('cloudinary').v2;
const express = require('express')
const router = express.Router()

const { CloudinaryStorage } = require('multer-storage-cloudinary');

const multer = require('multer');

cloudinary.config({
    cloud_name: 'dxtpcpwwf',
    api_key: '679544638251481',
    api_secret: '-wlVUN0JRZfaNDAZHW6dZMiOYRM'
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        resource_type: 'auto',
        folder: 'RV-wala',
        format: async (req, file) => file.originalname.substr(file.originalname.lastIndexOf('.') + 1), // supports promises as well
        public_id: (req, file) => Date.now().toString()
    },
});
const parser = multer({
    storage: storage
});

const actions = {

  uploadFiles: asyncMiddleware(async (req, res) => {
    if(files.length>0){
        res.status(statusCodes.success.accepted).json({
            message: 'Files uploaded successfully',
            status: statusCodes.success.accepted,
          })
    }
    else{
        res.status(statusCodes.client.badRequest).json({
            message: 'Please upload photos',
            status: statusCodes.client.badRequest,
          }) 
    }
    
  }),
  getSeedData: asyncMiddleware(async (req, res) => {
    let { names } = req.body
    let seeds = await SeedModel.find({ name: { $in : names} })
    if(seeds.length>0){
        res.status(statusCodes.success.accepted).json({
            message: 'Seeds fetched successfully',
            data:seeds,
            status: statusCodes.success.accepted,
          })
    }
    else{
        res.status(statusCodes.client.badRequest).json({
            message: 'Please supply names of seed',
            status: statusCodes.client.badRequest,
          }) 
    }
    
  }),
  
 
 
}

router.post('/upload-file',jwt.verifyJwt,parser.array('files') ,actions.uploadFiles)
router.post('/get-seed' ,actions.getSeedData)

module.exports = router

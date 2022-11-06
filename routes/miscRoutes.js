const { UserModel, SeedModel } = require('../models')
const {
  jwt,
  asyncMiddleware,
  statusCodes,
} = require('../utils/index')
const cloudinary = require('cloudinary').v2;
const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk');
const { S3Client } = require('@aws-sdk/client-s3')
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer')
const multerS3 = require('multer-s3')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region:'ca-central-1'
});

const credentials = {
  region: 'ca-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  }
};
// const s3 =new S3Client(credentials);
const s3 =new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region:'ca-central-1'
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'rv-wala-bucket',
     metadata: function (req, file, cb) {
      console.log({files:req.files})
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      console.log({file:req.files},"key")
      cb(null, Date.now().toString()+file.originalname+Date.now().toString())
    }
  }),
  preservePath:true
})

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
    try{
      let files =req.files;
      console.log({files:req.files})
     if(files.length>0){
         res.status(statusCodes.success.accepted).json({
             message: 'Files uploaded successfully',
             data:files,
             status: statusCodes.success.accepted,
           })
     }
     else{
         res.status(statusCodes.client.badRequest).json({
             message: 'Please upload photos',
             status: statusCodes.client.badRequest,
           }) 
     }
    }
    catch(e){
      console.log({e})
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
    
  })
  

 
 
}

// router.post('/upload-file',parser.array('files') ,actions.uploadFiles)
router.post('/upload-file',upload.array('files') ,actions.uploadFiles)
router.post('/get-seed',actions.getSeedData)

module.exports = router

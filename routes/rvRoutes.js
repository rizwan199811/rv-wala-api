const { UserModel, RVModel } = require('../models')
const {
  jwt,
  asyncMiddleware,
  statusCodes,
  passwordHash,
} = require('../utils/index')
const ejs = require('ejs')
const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const path = require('path')
const nodemailer = require('nodemailer')


const actions = {

  createRV: asyncMiddleware(async (req, res) => {
    let {id} =req.decoded;

    let user = await UserModel.findById(id)
    if (user) {
     req.body.user = id;   
     let newRV =  new RVModel({
        ...req.body
     })
    await newRV.save()  
    res.status(statusCodes.success.created).json({
        message: 'RV listed successfully',
        status: 200,
      })
     
    } else {
      res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: 400,
      })
    }
  }),


  listRV: asyncMiddleware(async (req, res) => {
    let {id} =req.decoded;
    let {page,limit} =req.body;
    let user = await UserModel.findById(id)
    if (user) {
     let rvs =  await  RVModel.paginate({},{
      page:page,
      limit:limit,
      lean:true
     })
    res.status(statusCodes.success.created).json({
        message: 'RVs fetched successfully',
        data:rvs,
        status: 200,
      })
     
    } else {
      res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: 400,
      })
    }

  })
 
 
}


//ADD
router.post('/list', jwt.verifyJwt,actions.listRV)
router.post('/',jwt.verifyJwt,actions.createRV)

module.exports = router

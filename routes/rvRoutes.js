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
    let { id } = req.decoded

    let user = await UserModel.findById(id)
    if (user) {
      req.body.user = id
      let newRV = new RVModel({
        ...req.body,
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
    let { id } = req.decoded
    let { page, limit } = req.body
    let user = await UserModel.findById(id)
    if (user) {
      let rvs = await RVModel.paginate(
        {},
        {
          page: page,
          limit: limit,
          lean: true,
        },
      )
      res.status(statusCodes.success.created).json({
        message: 'RVs fetched successfully',
        data: rvs,
        status: 200,
      })
    } else {
      res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: 400,
      })
    }
  }),
  getSingleRV: asyncMiddleware(async (req, res) => {
    let { id: userID } = req.decoded
    let { id: RVID } = req.params
    let user = await UserModel.findById(userID)
    if (!user) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: 400,
      })
    }
    let rv = await RVModel.findById(RVID).populate('user').lean(true)
    
    if (!rv) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'RV not found',
        status: 400,
      })
    }
    let listingCount = await RVModel.count({user:userID});
    rv.listingCount = listingCount;
    res.status(statusCodes.success.created).json({
      message: 'RV fetched successfully',
      data: rv,
      status: 200,
    })
  }),
}

//ADD
router.post('/list', jwt.verifyJwt, actions.listRV)
router.post('/', jwt.verifyJwt, actions.createRV)
router.get('/:id', jwt.verifyJwt, actions.getSingleRV)
module.exports = router

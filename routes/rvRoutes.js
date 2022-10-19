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
    let { page, limit, searchCriteria, token } = req.body

    let whereClause = {}
    if (searchCriteria.price) {
      whereClause['RVInfo.value'] = {
        $lt: searchCriteria.price.max,
        $gte: searchCriteria.price.min,
      }
    }
    if (searchCriteria.class) {
      whereClause['RVInfo.type'] = searchCriteria.class
    }
    if (token) {
      token = token.slice(7, token.length)
      let { id } = await jsonwebtoken.verify(token, 'thesecretekey')
      console.log({ id })
      whereClause['user'] = {
        $ne: id,
      }
    }
    if (searchCriteria.hasOwnProperty('disabled')) {
      whereClause['disabled'] = searchCriteria.disabled
    }
    console.log({whereClause})
    let rvs = await RVModel.paginate(whereClause, {
      populate: 'user',
      page: page,
      limit: limit,
      lean: true,
    })
    res.status(statusCodes.success.created).json({
      message: 'RVs fetched successfully',
      data: rvs,
      status: 200,
    })
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
    let listingCount = await RVModel.count({ user: userID })
    rv.listingCount = listingCount
    res.status(statusCodes.success.created).json({
      message: 'RV fetched successfully',
      data: rv,
      status: 200,
    })
  }),
  approveRV: asyncMiddleware(async (req, res) => {
    let { id: userID } = req.decoded
    let { id: RVID } = req.params
    let disabled
    let user = await UserModel.findById(userID)
    if (!user) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: 400,
      })
    }

    switch (req.body.status) {
      case 'approved':
        disabled = false
        break
      case 'rejected':
        disabled = true
        break
      default:
        break
    }
    let rv = await RVModel.findByIdAndUpdate(
      RVID,
      { status: req.body.status, disabled },
      { new: true },
    )
      .populate('user')
      .lean(true)
    if (!rv) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'RV not found',
        status: 400,
      })
    }
    let listingCount = await RVModel.count({ user: userID })
    rv.listingCount = listingCount
    res.status(statusCodes.success.created).json({
      message: 'RV fetched successfully',
      data: rv,
      status: 200,
    })
  }),
}

//ADD
router.post('/list', actions.listRV)
router.post('/', jwt.verifyJwt, actions.createRV)
router.get('/:id', jwt.verifyJwt, actions.getSingleRV)
router.post('/approve/:id', jwt.verifyJwt, actions.approveRV)
module.exports = router

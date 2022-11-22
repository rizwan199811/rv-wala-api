const { BlogModel, UserModel } = require('../models')
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
  createBlog: asyncMiddleware(async (req, res) => {
    let { id } = req.decoded

    let user = await UserModel.findById(id)
    if (!user) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: 400,
      })
    }

    req.body.user = id
    let newBlog = new BlogModel({
      ...req.body,
    })
    await newBlog.save()
    res.status(statusCodes.success.created).json({
      message: 'Blog saved successfully',
      status: 200,
    })
  }),

  listBlog: asyncMiddleware(async (req, res) => {
    let { page, limit } = req.body

    let whereClause = {}
    let blogs = await BlogModel.paginate(whereClause, {
      populate: 'user',
      page: page,
      limit: limit,
      lean: true,
    })
    res.status(statusCodes.success.created).json({
      message: 'Blogs fetched successfully',
      data: blogs,
      status: 200,
    })
  }),
  getSingleBlog: asyncMiddleware(async (req, res) => {
    let { id: userID } = req.decoded
    let { id: blogID } = req.params
    let user = await UserModel.findById(userID)
    if (!user) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: 400,
      })
    }
    let blog = await BlogModel.findById(blogID).populate('user').lean(true)

    if (!blog) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'Blog not found',
        status: 400,
      })
    }
    res.status(statusCodes.success.created).json({
      message: 'Blog fetched successfully',
      data: blog,
      status: 200,
    })
  }),
  editBlog: asyncMiddleware(async (req, res) => {
    let { id: userID } = req.decoded
    let { id: blogID } = req.params
    let user = await UserModel.findById(userID)
    if (!user) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: 400,
      })
    }

    let editedBlog = await BlogModel.findByIdAndUpdate(
      blogID,
      { ...req.body },
      { new: true },
    )
      .populate('user')
      .lean(true)
    if (!editedBlog) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'Something went wrong',
        status: 400,
      })
    }
    res.status(statusCodes.success.created).json({
      message: 'Blog updated successfully',
      data: editedBlog,
      status: 200,
    })
  }),
  deleteBlog: asyncMiddleware(async (req, res) => {
    let { id: userID } = req.decoded
    let { id: blogID } = req.params
    let user = await UserModel.findById(userID)
    let blog = await BlogModel.findById(blogID)
    if (!user) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: 400,
      })
    }
    if (!blog) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'Blog not found',
        status: 400,
      })
    }

    await BlogModel.findByIdAndRemove(blogID)
    res.status(statusCodes.success.created).json({
      message: 'Blog deleted successfully',
      status: 200,
    })
  }),
}

//ADD
router.post('/list', actions.listBlog)
router.post('/', jwt.verifyJwt, actions.createBlog)
router.get('/:id', jwt.verifyJwt, actions.getSingleBlog)
router.put('/:id', jwt.verifyJwt, actions.editBlog)
router.delete('/:id', jwt.verifyJwt, actions.deleteBlog)
module.exports = router

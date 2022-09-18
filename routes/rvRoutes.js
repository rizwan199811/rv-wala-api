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


  signUp: asyncMiddleware(async (req, res) => {
    let { email ,password} = req.body
    let user = await UserModel.findOne({ email: email })
    if (user) {
      res.status(statusCodes.success.accepted).json({
        message: 'Email already exists',
        status: 400,
      })
    } else {
      req.body.password = await passwordHash.hashPassword(password)
      let newUser = new UserModel({ ...req.body })
      let savedUser = await newUser.save()
      if (savedUser) {
        let newUser = await UserModel.findOne({ email: email })
        // let smtpTransport = initializeSMTP()
        // ejs.renderFile(
        //   path.join(__dirname, '../email-templates/credentials.ejs'),
        //   { name: newUser.name, email: newuser.email, password: random },
        //   async function (err, data) {
        //     if (err) {
        //       res.status(status.success.created).json({
        //         message: 'Something went wrong',
        //         status: 400,
        //       })
        //     } else {
        //       let mailOptions = mailOptionSetup(
        //         newuser.email,
        //         'Credentials For Athens Moving Experts',
        //         data,
        //       )
        //       try {
        //         await smtpTransport.sendMail(mailOptions)
                res.status(statusCodes.success.created).json({
                  message: 'User added successfully',
                  data:newUser,
                  status: 200,
                })
        //       } catch (e) {
        //         res.status(status.success.created).json({
        //           message: 'Something went wrong',
        //           status: 400,
        //         })
        //       }
        //     }
        //   },
        // )
        // res.status(statusCodes.success.accepted).json({
        //   message: 'Email already exists',
        //   status: 400,
        // })
      } else {
        res.status(statusCodes.client.badRequest).json({
          message: 'Something went wrong',
          status: 400,
        })
      }
    }
  })
 
 
}


//ADD
router.post('/signup', actions.signUp)
router.post('/',jwt.verifyJwt,actions.createRV)

module.exports = router

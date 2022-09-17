const { UserModel, VerificationModel } = require('../models')
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

const initializeSMTP = () => {
  let smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    // port: 465,
    // auth: {
    //     user: authConfig.user,
    //     pass: authConfig.pass
    // }
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  })

  return smtpTransport
}

const mailOptionSetup = (email, subject, data) => {
  return {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: data,
    secure: true,
  }
}

const actions = {

  login: asyncMiddleware(async (req, res) => {
    let { email, password } = req.body
    let { EXPIRES_IN } = process.env

    let user = await UserModel.findOne({ email: email }).select('+password')
    if (user) {
      console.log({password})
        let verified =  passwordHash.comparePassword(
          password,
          user.password,
        )
        console.log({verified})
        
        if (verified) {
          let loggedUser = user.toObject()
          delete loggedUser.password
          res.status(statusCodes.success.accepted).json({
            message: 'Logged In Successfully',
            data: loggedUser,
            token: 'Bearer ' + (await jwt.signJwt({ id: user.id }, EXPIRES_IN)),
            refreshToken:
              'Bearer ' + (await jwt.signJwt({ id: user.id }, '10d')),
            status: 200,
          })
        } else {
          res.status(statusCodes.client.badRequest).json({
            message: 'Wrong Password',
            status: 400,
          })
        }
     
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
        res.status(status.client.badRequest).json({
          message: 'Something went wrong',
          status: 400,
        })
      }
    }
  })
 
 
}


//ADD
router.post('/signup', actions.signUp)
router.post('/login', actions.login)

module.exports = router

const { UserModel, VerificationModel } = require('../models')
const {
  jwt,
  asyncMiddleware,
  statusCodes,
  passwordHash,
} = require('../utils/index')

const jsonwebtoken = require('jsonwebtoken')

const express = require('express')
const router = express.Router()



const actions = {

  login: asyncMiddleware(async (req, res) => {
    let { email, password,is_admin } = req.body
    let { EXPIRES_IN } = process.env;
    let user;
    if(is_admin){
      user = await UserModel.findOne({ email: email , role :{$in: ["super_admin", "admin"]}}).select('+password')
    }
    else{
      user = await UserModel.findOne({ email: email, role :{$in: ["user", "admin"]}}).select('+password')
    }
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
        message: 'Invalid credentials',
        status: 400,
      })
    }
  }),


  signUp: asyncMiddleware(async (req, res) => {
    let { email ,password} = req.body
    let user = await UserModel.findOne({ email: email })
    if (user) {
      res.status(statusCodes.client.badRequest).json({
        message: 'Email already exists',
        status: 400,
      })
    } else {
      req.body.password = await passwordHash.hashPassword(password)
      let newUser = new UserModel({ ...req.body })
      let savedUser = await newUser.save()
      if (savedUser) {
        let newUser = await UserModel.findOne({ email: email })
                res.status(statusCodes.success.created).json({
                  message: 'User added successfully',
                  data:newUser,
                  status: 200,
                })
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
router.post('/login', actions.login)

module.exports = router

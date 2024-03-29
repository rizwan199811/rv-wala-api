const { UserModel, SeedModel, RVModel, BookingModel } = require('../models')
const { jwt, asyncMiddleware, statusCodes } = require('../utils/index')
const cloudinary = require('cloudinary').v2
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const stripe = require('stripe')(process.env.STRIPE_KEY)

const { CloudinaryStorage } = require('multer-storage-cloudinary')

const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const actions = {
  createClient: asyncMiddleware(async (req, res) => {
    let { id } = req.decoded
    let user = await UserModel.findById(id).lean(true)

    stripe.customers
      .retrieve(user.stripeCustomer)
      .then(async (customerRetrieved) => {
        if (!customerRetrieved.deleted) {
          return res.status(statusCodes.success.accepted).json({
            message: 'Customer fetched successfully',
            data: customerRetrieved,
            status: statusCodes.success.accepted,
          })
        }
        const customer = await stripe.customers.create({ ...req.body })
        if (customer) {
          await UserModel.findByIdAndUpdate(
            id,
            { stripeCustomer: customer.id },
            { new: true },
          )
          res.status(statusCodes.success.accepted).json({
            message: 'Customer created successfully',
            data: customer,
            status: statusCodes.success.accepted,
          })
        }
      })
      .catch(async (e) => {
        console.log({ e })
        const customer = await stripe.customers.create({ ...req.body })
        if (customer) {
          await UserModel.findByIdAndUpdate(
            id,
            { stripeCustomer: customer.id },
            { new: true },
          )
          res.status(statusCodes.success.accepted).json({
            message: 'Customer created successfully',
            data: customer,
            status: statusCodes.success.accepted,
          })
        }
      })
  }),
  attachPayment: asyncMiddleware(async (req, res) => {
    try {
      const { paymentMethod } = req.body
      let { id } = req.decoded
      let user = await UserModel.findById(id).lean(true)
      if (!user) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'User not found',
          status: statusCodes.client.badRequest,
        })
      }

      const paymentMethodAttach = await stripe.paymentMethods.attach(
        paymentMethod.id,
        {
          customer: user.stripeCustomer,
        },
      )
      if (paymentMethodAttach) {
        res.status(statusCodes.success.accepted).json({
          message: 'Payment attached successfully',
          data: paymentMethodAttach,
          status: statusCodes.success.accepted,
        })
      } else {
        res.status(statusCodes.client.badRequest).json({
          message: 'Could not attach method',
          status: statusCodes.client.badRequest,
        })
      }
    } catch ({ message }) {
      res.status(statusCodes.server.internalServerError).json({
        message: message,
        status: statusCodes.client.badRequest,
      })
    }
  }),
  getPaymentMethods: asyncMiddleware(async (req, res) => {
    let { id } = req.decoded
    let user = await UserModel.findById(id).lean(true)
    if (!user) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'User not found',
        status: statusCodes.client.badRequest,
      })
    }
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomer,
      type: 'card',
    })
    if (paymentMethods) {
      res.status(statusCodes.success.accepted).json({
        message: 'Payment attached successfully',
        data: paymentMethods,
        status: statusCodes.success.accepted,
      })
    } else {
      res.status(statusCodes.client.badRequest).json({
        message: 'Could not attach method',
        status: statusCodes.client.badRequest,
      })
    }
  }),

  createPaymentIntent: asyncMiddleware(async (req, res) => {
    const { paymentMethod, amount, RVId, dates, guests ,bookingObj} = req.body
    const currency = 'CAD'

    let { id } = req.decoded
    let customer = await UserModel.findById(id).lean(true)
    if (!customer) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'Customer not found',
        status: statusCodes.client.badRequest,
      })
    }
    let RV = await RVModel.findById({_id:RVId}).lean(true)
    if (!RV) {
      return res.status(statusCodes.client.badRequest).json({
        message: 'RV not found',
        status: statusCodes.client.badRequest,
      })
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency,
      customer: customer.stripeCustomer,
      payment_method: paymentMethod,
      // confirmation_method: "manual", // For 3D Security
      description: 'Rent a RV',
    })
    if (paymentIntent) {
      await BookingModel.create({
        dates,
        RV: RVId,
        host: RV.user || '',
        customer:id,
        paymentIntent,
        guests,
        status: 'pending',
        ...bookingObj
      })
      res.status(statusCodes.success.accepted).json({
        message:
          'Booking request recieved.We will notify you once its confirmed',
        data: paymentIntent,
        status: statusCodes.success.accepted,
      })
    } else {
      res.status(statusCodes.client.badRequest).json({
        message: 'Could not create payment intent',
        status: statusCodes.client.badRequest,
      })
    }
  }),

  confirmPayment: asyncMiddleware(async (req, res) => {
    const { paymentIntent, paymentMethod, RVId, dates, bookingID } = req.body
    console.log({ RVId })

    if (!mongoose.Types.ObjectId.isValid(RVId))
      return res.status(statusCodes.client.badRequest).json({
        message: 'ID does not exists',
        status: statusCodes.client.badRequest,
      })
    try {
      // let { id } = req.decoded
      // let user = await UserModel.findById(id).lean(true)
      let RV = await RVModel.findById(RVId).lean(true)
      // if (!user) {
      //   return res.status(statusCodes.client.badRequest).json({
      //     message: 'User not found',
      //     status: statusCodes.client.badRequest,
      //   })
      // }
      if (!RV) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'RV not found',
          status: statusCodes.client.badRequest,
        })
      }
      const result = dates.every((val) => RV.reserved_dates && RV.reserved_dates.includes(val))
      if (result) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'RV is already reserved on your required dates',
          status: statusCodes.client.badRequest,
        })
      }

      const intent = await stripe.paymentIntents.confirm(paymentIntent, {
        payment_method: paymentMethod,
      })
      if (intent) {
        let overallDates = RV.reserved_dates
          ? [...RV.reserved_dates].concat(dates)
          : []
        console.log({ bookingID })
        await BookingModel.findOneAndUpdate(
          bookingID,
          { status: 'processing' },
          { new: true },
        )
        await RVModel.findByIdAndUpdate(
          { _id: RVId },
          { reserved_dates: overallDates },
          { new: true },
        )
        res.status(statusCodes.success.accepted).json({
          message: 'Payment confirmed successfully',
          data: intent,
          status: statusCodes.success.accepted,
        })
      }

      // stripe.charges.create({
      //     amount: amount,
      //     currency: 'cad',
      //     source: stripeToken,
      //     capture: false, // note that capture: false
      // }).then(async (charge)=>{
      //  let captured= await stripe.charges.capture(charge.id)
      //  res.status(statusCodes.success.accepted).json({
      //     message: 'Payment confirmed successfully',
      //     data:captured,
      //     status: statusCodes.success.accepted,
      //   });
      // })

      /* Update the status of the payment to indicate confirmation */
    } catch ({message}) {
      console.error(message)
      res.status(statusCodes.client.badRequest).json({
        message,
        status: statusCodes.client.badRequest,
      })
    }
  }),
  cancelPayment: asyncMiddleware(async (req, res) => {
    const { paymentIntent, paymentMethod, RVId, dates } = req.body
    console.log({ RVId })
    if (!mongoose.Types.ObjectId.isValid(RVId))
      return res.status(statusCodes.client.badRequest).json({
        message: 'ID does not exists',
        status: statusCodes.client.badRequest,
      })
    try {
      let { id } = req.decoded
      let user = await UserModel.findById(id).lean(true)
      let RV = await RVModel.findById(RVId).lean(true)
      if (!user) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'User not found',
          status: statusCodes.client.badRequest,
        })
      }
      if (!RV) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'RV not found',
          status: statusCodes.client.badRequest,
        })
      }

      const intent = await stripe.paymentIntents.confirm(paymentIntent, {
        payment_method: paymentMethod,
      })
      if (intent) {
        let overallDates = RV.reserved_dates
          ? [...RV.reserved_dates].concat(dates)
          : []
        await BookingModel.create({
          dates,
          user: id,
          RV: RVId,
          paymentIntent: paymentIntent,
        })
        // await UserModel.findByIdAndUpdate({_id:id},{bookings:[]},{new:true})
        await RVModel.findByIdAndUpdate(
          { _id: RVId },
          { booked: true, reserved_dates: overallDates },
          { new: true },
        )
        res.status(statusCodes.success.accepted).json({
          message: 'Payment confirmed successfully',
          data: intent,
          status: statusCodes.success.accepted,
        })
      }
    } catch (err) {
      console.error(err)
      res.status(statusCodes.client.badRequest).json({
        message: 'Could not confirm payment',
        status: statusCodes.client.badRequest,
      })
    }
  }),
}

router.post('/create-client', jwt.verifyJwt, actions.createClient)
router.post('/intent', jwt.verifyJwt, actions.createPaymentIntent)
router.post('/attach-payment', jwt.verifyJwt, actions.attachPayment)
router.get('/fetch-payment-methods', jwt.verifyJwt, actions.getPaymentMethods)
router.post('/confirm', actions.confirmPayment)

module.exports = router

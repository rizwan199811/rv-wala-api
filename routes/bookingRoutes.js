const { UserModel, BookingModel, RVModel } = require('../models')
const { jwt, asyncMiddleware, statusCodes } = require('../utils/index')
const express = require('express')
const router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_KEY)

const actions = {
  bookingList: asyncMiddleware(async (req, res) => {
    try {
      let { id } = req.decoded
      let user = await UserModel.findById(id).lean(true)
      if (!user) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'User not found',
          status: statusCodes.client.badRequest,
        })
      }
      let bookings = await BookingModel.paginate(
        { user: id },
        {
          populate: 'user RV',
          page: 1,
          limit: 10,
          lean: true,
        },
      )
      res.status(statusCodes.success.accepted).json({
        message: 'Bookings fetched successfully',
        data: bookings,
        status: statusCodes.success.accepted,
      })
    } catch (e) {
      console.log({ e })
    }
  }),
  cancelBooking: asyncMiddleware(async (req, res) => {
    try {
      let { id } = req.decoded
      let { paymentIntent, cancellationDate, bookingID, RVID } = req.body
      let RV = await RVModel.findById(RVID).lean(true)
      if (!RV) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'RV not found',
          status: statusCodes.client.badRequest,
        })
      }
      let user = await UserModel.findById(id).lean(true)
      if (!user) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'User not found',
          status: statusCodes.client.badRequest,
        })
      }
      let booking = await BookingModel.findById(bookingID).lean(true)
      if (!booking) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'Booking not found',
          status: statusCodes.client.badRequest,
        })
      }
      console.log({ booking: booking.user, RV: RV.user })
      let owner = booking.user.toString() === RV.user.toString()
      console.log({ owner })

      if (owner) {
        // const refund = await stripe.refunds.create({
        //   payment_intent: booking.paymentIntent.id,
        //   amount: booking.paymentIntent.amount,
        // });
        let reserved_dates = RV.reserved_dates
        let booking_dates = booking.dates
        console.log({ booking_dates, reserved_dates })
        for (let i = 0; i < booking_dates.length; i++) {
          reserved_dates = reserved_dates.filter((x) => {
            return x !== booking_dates[i]
          })
        }

        console.log({ reserved_dates })
        // return

        if (booking.status == 'pending') {
          await BookingModel.findByIdAndUpdate(
            bookingID,
            { status: 'cancelled' },
            { new: true },
          )

          const paymentIntent = await stripe.paymentIntents.cancel(
            booking.paymentIntent.id,
          )

          return res.status(statusCodes.success.accepted).json({
            message: 'Booking cancelled successfully',
            status: statusCodes.success.accepted,
          })
        }

        if (booking.status == 'confirmed') {
          await RVModel.findByIdAndUpdate(
            RVID,
            {
              reserved_dates,
            },
            {
              new: true,
            },
          )
          await BookingModel.findByIdAndUpdate(
            bookingID,
            { status: 'cancelled' },
            { new: true },
          )
          const refund = await stripe.refunds.create({
            payment_intent: booking.paymentIntent.id,
            amount: booking.paymentIntent.amount,
          })

          return res.status(statusCodes.success.accepted).json({
            message: 'Booking cancelled successfully',
            status: statusCodes.success.accepted,
          })
        }
        if (booking.status == 'cancelled') {
          return res.status(statusCodes.client.badRequest).json({
            message: 'Booking already cancelled',
            status: statusCodes.client.badRequest,
          })
        }
      }
      else{
        
      }

      return

      let bookings = await BookingModel.paginate(
        { user: id },
        {
          populate: 'user RV',
          page: 1,
          limit: 10,
          lean: true,
        },
      )
      res.status(statusCodes.success.accepted).json({
        message: 'Bookings fetched successfully',
        data: bookings,
        status: statusCodes.success.accepted,
      })
    } catch ({ message }) {
      console.log({ message })
      res.status(statusCodes.client.badRequest).json({
        message,
        status: statusCodes.client.badRequest,
      })
    }
  }),
}

router.post('/cancel', jwt.verifyJwt, actions.cancelBooking)
router.get('/list', jwt.verifyJwt, actions.bookingList)

module.exports = router

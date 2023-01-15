const { UserModel, BookingModel, RVModel } = require('../models')
const { jwt, asyncMiddleware, statusCodes } = require('../utils/index')
const express = require('express')
const moment = require('moment')
const router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_KEY)
const axios =require('axios');
const checkCancellationCriteria = (rentalStartDate, amount) => {
  let now = moment() //now
  let amountToReturn
  let startDate = moment(rentalStartDate)
  const diff = startDate.diff(now, 'days')
  if (diff > 30) {
    amountToReturn = amount
  }
  if (diff >= 8 && diff <= 30) {
    amountToReturn = amount * 0.5
  }
  if (diff <= 7) {
    amountToReturn = 0
  }

  console.log({ amountToReturn, diff })
}
checkCancellationCriteria('2023-01-02', 25)

const completeBooking=()=>{

}
const actions = {
  bookingList: asyncMiddleware(async (req, res) => {
    try {
      // console.log("called")
      let { id } = req.decoded
      console.log({ id })
      let { page, limit, isHost } = req.body
      let query = {}

      let user = await UserModel.findById(id).lean(true)
      if (!user) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'User not found',
          status: statusCodes.client.badRequest,
        })
      }

      if (isHost) {
        query['host'] = id
      } else {
        query['customer'] = id
      }
      let bookings = await BookingModel.paginate(query, {
        populate: 'host customer RV',
        page,
        limit,
        lean: true,
      })
      res.status(statusCodes.success.accepted).json({
        message: 'Bookings fetched successfully',
        data: bookings,
        status: statusCodes.success.accepted,
      })
    } catch (e) {
      console.log({ error: e })
    }
  }),
  fetchBooking: asyncMiddleware(async (req, res) => {
    try {
      let { id } = req.decoded
      let { id: bookingID } = req.params
      let user = await UserModel.findById(id).lean(true)
      if (!user) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'User not found',
          status: statusCodes.client.badRequest,
        })
      }
      let booking = await BookingModel.findById(bookingID).populate(
        'RV user customer host',
      )
      res.status(statusCodes.success.accepted).json({
        message: 'Booking fetched successfully',
        data: booking,
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
      } else {
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
  completeBooking: asyncMiddleware(async (req, res) => {
    try {
 
      let { paymentIntent, completionDate, bookingID, RVId } = req.body
      let RV = await RVModel.findById(RVId).lean(true)
      if (!RV) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'RV not found',
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
      const refundAmount= booking.bookingDetails.booking_deposit || 0 + booking.bookingDetails.damage_deposit || 0 ;
      const ownerAmount = booking.bookingDetails.invoice.total || 0 -  refundAmount -  booking.bookingDetails.invoice.total * 0.1;
      const refund = await stripe.refunds.create({
        payment_intent: booking.paymentIntent.id,
        amount: parseInt(refundAmount) ,
      })

      const transfer = await stripe.transfers.create({
        amount: parseInt(ownerAmount),
        currency: "cad",
        destination: RV.PaymentInfo.account_number,
      });
      await BookingModel.findByIdAndUpdate(
        bookingID,
        { status: 'completed' },
        { new: true },
      )

      return res.status(statusCodes.success.accepted).json({
        message: 'Booking completed successfully',
        status: statusCodes.success.accepted,
      })

      

     

      

      return



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
      } else {
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
  updateBookingStatus: asyncMiddleware(async (req, res) => {
    try {
      // const baseURL = "http://localhost:4000/api";
      const baseURL = "http://3.99.168.68:4000/api";
      let body={};
      let { id } = req.decoded
      let { status, bookingID, RVId,paymentIntent, paymentMethod,dates } = req.body
      let RV = await RVModel.findById(RVId).lean(true)
      if (!RV) {
        return res.status(statusCodes.client.badRequest).json({
          message: 'RV not found',
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
      console.log({status})
      switch (status) {
        case 'processing':
          body={
            bookingID,
            RVId,
            paymentIntent,
            paymentMethod,
            dates
          }
          const {
            data: { data:processingData,message:processingMessage },
          } = await axios.post(baseURL + '/payment/confirm',body);
          return res.status(statusCodes.success.accepted).json({
            message:processingMessage,
            data: processingData,
            status: statusCodes.success.accepted,
          })
          break
        case 'hold':
          break
        case 'cancelled':
          break
        case 'completed':
          body={
            bookingID,
            RVId,
            paymentIntent,
            paymentMethod,
            dates
          }
          const {
            data: { data,message },
          } = await axios.post(baseURL + '/booking/completed',body);
          return res.status(statusCodes.success.accepted).json({
            message,
            data: data,
            status: statusCodes.success.accepted,
          })
          break

        default:
          break
      }
      return
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
      } else {
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
router.post('/list', jwt.verifyJwt, actions.bookingList)
router.get('/:id', jwt.verifyJwt, actions.fetchBooking)
router.post('/status', jwt.verifyJwt, actions.updateBookingStatus)
router.post('/completed', actions.completeBooking)

module.exports = router

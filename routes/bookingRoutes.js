const { UserModel, BookingModel, RVModel } = require('../models')
const { jwt, asyncMiddleware, statusCodes } = require('../utils/index')
const express = require('express')
const router = express.Router()

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
      let { id } = req.params;
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
      console.log({booking:booking.user,RV:RV.user})
      let owner = booking.user.toString() === RV.user.toString();
      console.log({owner})
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
    } catch (e) {
      console.log({ e })
    }
  }),
}

router.post('/cancel/:id', actions.cancelBooking)
router.get('/list', jwt.verifyJwt, actions.bookingList)

module.exports = router

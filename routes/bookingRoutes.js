const { UserModel, BookingModel } = require('../models')
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
  })
}

router.get('/list', jwt.verifyJwt, actions.bookingList)

module.exports = router

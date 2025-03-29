
const express = require("express")
const router = express.Router()

//import controller
const payment = require("../controllers/payment-controller")


//import middleware
const { authorize } = require("../middlewares/authenticate")


//@ENDPOINT http://localhost:8001/api/user/payment/checkout
router.post('/payment/checkout', authorize ,payment.checkOut )  
router.get('/payment/checkout-status/:session_id', authorize ,payment.checkOutStatus )  



//export
module.exports = router
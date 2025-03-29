//1:: check out 
//2:: view buyer order
//2:: view seller  order
//3:: payment
//4:: update order status 

const express = require("express")
const router = express.Router()

//import controller
const orderController = require("../controllers/order-controller")

//import validator 

//import middleware
const { authorize } = require("../middlewares/authenticate")


//@ENDPOINT http://localhost:8001/api/order/checkout

router.post('/order/checkout', authorize ,orderController.add )  
router.get('/order/buyer/list', authorize ,orderController.show )  
router.get('/order/buyer/detail/:orderId', authorize ,orderController.showDetail )  
router.get('/order/buyer/detail/', authorize ,orderController.showDetailfromCart )  

router.get('/order/seller/', authorize ,orderController.sellerView )  
router.patch('/order/:orderId', authorize ,orderController.update )  





//export
module.exports = router
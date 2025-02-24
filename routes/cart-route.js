//1:: add buyer cart 
//2:: view buyer cart
//3:: update buyer cart
//4:: delete buyer product in cart


const express = require("express")
const router = express.Router()

//import controller
const cartController = require("../controllers/cart-controller")

//import validator 

//import middleware
const { authorize } = require("../middlewares/authenticate")

//@ENDPOINT http://localhost:8001/api/cart
router.post('/cart', authorize ,cartController.add )  
router.get('/cart', authorize ,cartController.show )  
router.post('/cart/remove', authorize ,cartController.remove )  
router.delete('/cart/clear', authorize ,cartController.clear )  

//export
module.exports = router
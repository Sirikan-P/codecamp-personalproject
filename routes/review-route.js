//1:: add product review  
//2:: view product review 
//3:: update review
//4:: delete review

const express = require("express")
const router = express.Router()

//import controller 
const reviewController = require("../controllers/review-controller")

//import validator

//import middleware
const { authorize } = require("../middlewares/authenticate")


//@ENDPOINT http://localhost:8001/api/cart
router.post('/review', authorize ,reviewController.add )
router.get('/review', authorize ,reviewController.show )
router.patch('/review', authorize ,reviewController.update )
router.delete('/review', authorize ,reviewController.delete )

//export
module.exports = router
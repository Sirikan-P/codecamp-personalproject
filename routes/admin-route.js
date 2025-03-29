//1:: view product
//2:: update product
//3:: view user
//4:: update user
//5:: add admin

const express = require("express")
const router = express.Router()

//import controller 
const adminController = require("../controllers/admin-controller")


//import validator


//import middleware
const { authorize } = require("../middlewares/authenticate")

//@ENDPOINT http://localhost:8001/api/admin
router.get('/admin/product', authorize , adminController.show )
router.put('/admin/product/:id', authorize , adminController.update )
router.get('/admin/user/', authorize , adminController.getUser )
router.put('/admin/user/:id', authorize , adminController.updateUser )



//export
module.exports = router
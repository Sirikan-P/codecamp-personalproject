//import lib..
const express = require("express")
const router = express.Router()

//import contoller..
const userController = require('../controllers/user-controller')

//import validator.. 

//import middleware..
const { authorize } = require("../middlewares/authenticate")
const upload = require("../middlewares/upload")

//route 
//@ENDPOINT http://localhost:8000/api/users
//api user profile  ------------
router.get('/user',authorize, userController.listProfile)
router.patch('/user/:id',authorize, upload.single('profileImage') ,userController.updateProfile)


//export
module.exports = router
const express = require("express")
const router = express.Router()

//import controller
const authController = require("../controllers/auth-controller")

//import validator 
const {validateWithZod , registerSchema, loginSchema} = require("../middlewares/validator")

//import middleware
const { authorize } = require("../middlewares/authenticate")


//@ENDPOINT http://localhost:8001/api/register
router.post('/register', validateWithZod(registerSchema), authController.register ) 
router.post('/login', validateWithZod(loginSchema),authController.login)


router.get('/currentuser', authorize ,authController.currentUser) //authen for pages : verify token

//export
module.exports = router
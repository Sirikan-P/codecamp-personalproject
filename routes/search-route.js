//import lib..
const express = require("express")
const router = express.Router()


//import contoller..
const searchController = require('../controllers/search-controller')

//import validator.. 

//import middleware..

//route 
//@ENDPOINT http://localhost:8000/api/search
//api search -------------------------------
router.get('/search' , searchController.searchProduct ) 
router.get('/search/:id' , searchController.searchProductDetail ) 


//export
module.exports = router
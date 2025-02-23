//import lib..
const express = require("express")
const router = express.Router()

//import contoller..
const productController = require('../controllers/product-controller')

//import validator.. 


//import middleware..
const { authorize } = require("../middlewares/authenticate")

//route 
//@ENDPOINT http://localhost:8000/api/product
//api manage product  ------------
router.post('/product' , productController.addProduct)
router.get('/product/seller/:id' , productController.showAllProducts)
router.get('/product/:id' , productController.showProductDetail)
router.put('/product/:id' , productController.updateProduct)
router.delete('/product/:id' , productController.deleteProduct)


//export
module.exports = router
//import lib..
const express = require("express")
const router = express.Router()

//import contoller..
const productController = require('../controllers/product-controller')

//import validator.. 


//import middleware..
const { authorize } = require("../middlewares/authenticate")
const upload = require("../middlewares/upload")

//route 
//@ENDPOINT http://localhost:8000/api/product
//api  listing ------------

router.post('/product' , authorize, upload.array('images',5),productController.addProduct)
router.get('/product/seller/:id' , authorize, productController.showAllProducts)
router.patch('/product/:id' , authorize, upload.array('images',5) , productController.updateProduct)
router.delete('/product/:id' , authorize ,productController.deleteProduct)

//single product ----------
router.get('/product/:id' , productController.showProductDetail)

//export
module.exports = router
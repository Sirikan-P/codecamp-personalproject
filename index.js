//import lib ...
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

//import router ...
const authRouter = require("./routes/auth-route")
const userRouter = require("./routes/user-route")
const productRouter = require("./routes/product-route")
const searchRouter = require("./routes/search-route")
const cartRouter = require("./routes/cart-route")
const orderRouter = require("./routes/order-route")
const paymentRouter = require("./routes/payment-route")
const reviewRouter = require("./routes/review-route")
const adminRoute = require("./routes/admin-route")

//import handle error ...
const handleErrors = require('./middlewares/error')
const notFound = require('./middlewares/notfound')

//app ---------------------------------------------------------------
const app = express()

//Middlewares
app.use(cors()) 
app.use(morgan('dev'))
app.use(express.json())

//routing
app.use('/api' , authRouter)
app.use('/api' , userRouter)
app.use('/api' , productRouter)
app.use('/api' , searchRouter)
app.use('/api' , cartRouter )
app.use('/api' , orderRouter )
app.use('/api' , paymentRouter )






//notfound
app.use(notFound)

//handle error
app.use(handleErrors) 

//start server
const PORT = 8001
app.listen(PORT,()=> console.log(`Server is running on port ${PORT}`))
const prisma = require("../configs/prisma")
const createError = require('../utils/createError');

const stripe = require('stripe')('sk_test_51QzCc807JCuZBtxv0GZGm9E6YV4N1MYH6zvutZTpcAvmO5N0po0Y1mYooP3qKkBtn9AZi4octHqcepQMzySKbDIk00BeEjNVBa')

exports.checkOut = async (req, res, next) => {
  try {
    const { id } = req.body;
    //console.log("payment order", id)
    const order = await prisma.order.findFirst({
      where: { id: parseInt(id) },
      include: {
        OrderProduct: {
          include: {
            product: true
          }
        }
      }
    });

    //stripe --
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      metadata: { orderId: parseInt(id) },
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          quantity: 1,
          price_data: {
            currency: "thb",
            product_data: {
              name: "order"
            },
            unit_amount: parseInt(order.totalPrice)*100 ,
          }
        },
      ],
      mode: 'payment',
      return_url: `http://localhost:5173/user/complete/{CHECKOUT_SESSION_ID}`,
    });

    res.send({ clientSecret: session.client_secret });
  } catch (error) {
    next(error)
  }
}



exports.checkOutStatus = async (req, res, next) => {
  try {
    const { session_id } = req.params
    //stripe --
    const session = await stripe.checkout.sessions.retrieve(session_id)
    const orderId = session.metadata?.orderId

    if (session.status !== "complete") {
      return createError(400, "Something wrong")
    }

    // console.log(session) 
    // console.log("orderId",orderId) 

    // update order status-----------------------
    const result = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        paymentStatus: "COMPLETE",
        orderStatus: "SHIPPING"
      }
    })

    //update product order qty = order prduct qty 

    res.json({ message: "payment complete" })
  } catch (error) {
    next(error)
  }
}
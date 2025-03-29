//1:: check out 
//2:: view buyer order
//2:: view seller  order
//3:: payment
//4:: update order status


const prisma = require("../configs/prisma")
const createError = require("../utils/createError")



exports.add = async (req, res, next) => {
  try {
    const buyerId = Number(req.user.id);

    // ดึงสินค้าทั้งหมดจากตะกร้า
    const cartItems = await prisma.productCart.findMany({
      where: { buyerId },
      include: { product: true } // ดึงราคาสินค้ามาด้วย
    });

    if (cartItems.length === 0) {
      return createError(400, "Cart is empty")
    }

    // คำนวณราคาทั้งหมดและส่วนลด
    let totalOrderPrice = 0;
    const orderProductsData = cartItems.map(item => {
      const price = item.product.price;
      //const discount = price > 500 ? price * 0.05 : 0; // ส่วนลด 5% สำหรับสินค้าราคา > 500
      const totalPrice = item.qty * (price);

      totalOrderPrice += totalPrice;

      return {
        productId: item.productId,
        qty: item.qty,
        discount: 0,
        totalPrice
      };
    });

    // สร้างคำสั่งซื้อใหม่ในฐานข้อมูล status Inprocess
    const newOrder = await prisma.order.create({
      data: {
        buyerId,
        totalPrice: totalOrderPrice,
        OrderProduct: {
          create: orderProductsData
        }
      },
      include: { OrderProduct: true }
    });

    // อัปเดต orderqty ของสินค้าแต่ละชิ้น
    for (const item of orderProductsData) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { orderqty: { increment: item.qty } } // บวกจำนวนที่สั่งเข้าไปใน orderqty
      });
    }

    // ลบสินค้าทั้งหมดออกจากตะกร้า
    await prisma.productCart.deleteMany({
      where: { buyerId }
    });

    res.json({
      message: "Order placed wait for payment",
      order: { newOrder }
    });
  } catch (error) {
    next(error)
  }
}


exports.show = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { status } = req.query;

    // ค้นหาคำสั่งซื้อของผู้ใช้
    const orders = await prisma.order.findMany({
      where: {
        buyerId,
        ...(status && { orderStatus: status })
      },
      select: {
        id: true,
        paymentStatus: true,
        orderStatus: true,
        totalPrice: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ orders });

    res.json({ msg: "show data" });
  } catch (error) {
    next(error)
  }
}

exports.showDetailfromCart = async (req, res, next) => {
  try {
    const buyerId = req.user.id;

    //0 คือมาจากหน้าตะกร้า
    const order = await prisma.order.findFirst({
      where: {
        buyerId: buyerId,
        orderStatus: "INPROCESS"
      },
      include: {
        OrderProduct: {
          include: {
            product: {
              include: {
                ProductImage: true // รวมข้อมูล ProductImage
              }
            }

          }
        }
      }
    })

    if (!order) {
      return createError(400, "Order not found")

    }

    res.json({ order: order });


  } catch (error) {
    next(error)
  }
}

exports.showDetail = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const orderId = parseInt(req.params.orderId);

    // ค้นหาคำสั่งซื้อพร้อมสินค้าที่สั่ง
    const order = await prisma.order.findFirst({
      where: { id: orderId, buyerId },
      include: {
        OrderProduct: {
          include: {
            product: {
              include: {
                ProductImage: true // รวมข้อมูล ProductImage
              }
            }

          }
        }
      }
    });


    if (!order) {
      return createError(400, "Order not found")

    }


    res.json({ order: order });


  } catch (error) {
    next(error)
  }
}


exports.update = async (req, res, next) => {
  try {

    const orderId = parseInt(req.params.orderId);
    const { orderStatus } = req.body;


    // ตรวจสอบว่ามี order หรือไม่
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ตรวจสอบว่าสถานะที่ส่งมาเป็น "DELIVERED" เท่านั้น
    if (orderStatus !== "COMPLETE") {
      return res.status(400).json({ error: "Invalid order status update" });
    }

    // อัปเดตสถานะคำสั่งซื้อเป็น DELIVERED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "COMPLETE"
      }
    });

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    next(error)
  }
}

exports.delete = async (req, res, next) => {
  const { data } = req.body;
  try {
    res.json({ msg: "delete" });
  } catch (error) {
    next(error)
  }
}



//------------------------------------------------------------------------
exports.sellerView = async (req, res, next) => {
  try {
    const sellerId = req.user.id; // ID ของผู้ขายที่ล็อกอินอยู่

    // ดึงรายการสินค้าที่ผู้ขายเป็นเจ้าของ
    const sellerProducts = await prisma.product.findMany({
      where: { sellerId: sellerId },
      select: { id: true }
    });

    const sellerProductIds = sellerProducts.map((product) => product.id);
    // ดึงคำสั่งซื้อที่มีสินค้าของผู้ขายเท่านั้น
    const orders = await prisma.order.findMany({
      where: {
        OrderProduct: {
          some: {
            productId: { in: sellerProductIds }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        OrderProduct: {
          where: {
            productId: { in: sellerProductIds }
          },
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // จัดรูปแบบข้อมูล
    const formattedOrders = orders.map(order => ({
      id: order.id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      buyer: order.user,
      products: order.OrderProduct.map(item => ({
        productId: item.productId,
        name: item.product.name,
        qty: item.qty,
        totalPrice: item.totalPrice
      }))
    }));


  } catch (error) {
    next(error)
  }
}



//------------------------------------------------------------------------
exports.adminView = async (req, res, next) => {
  try {
    const { status } = req.query;

    // ค้นหาคำสั่งซื้อทั้งหมด (เฉพาะ Seller/Admin เท่านั้น)
    const orders = await prisma.order.findMany({
      where: {
        ...(status && { orderStatus: status })
      },
      select: {
        id: true,
        paymentStatus: true,
        orderStatus: true,
        totalPrice: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // จัดรูปแบบข้อมูล
    const formattedOrders = orders.map(order => ({
      id: order.id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      buyer: order.user
    }));

    res.json({ orders: formattedOrders });


  } catch (error) {
    next(error)
  }
}


exports.adminViewDetail = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.orderId);

    // ค้นหาคำสั่งซื้อพร้อมสินค้าที่สั่ง
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderProducts: {
          include: { product: { select: { name: true } } }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // จัดรูปแบบข้อมูล
    const formattedOrder = {
      ...order,
      buyer: order.user,
      orderProducts: order.orderProducts.map(item => ({
        productId: item.productId,
        name: item.product.name,
        qty: item.qty,
        discount: item.discount,
        totalPrice: item.totalPrice
      }))
    };

    res.json({ order: formattedOrder });

  } catch (error) {
    next(error)
  }
}
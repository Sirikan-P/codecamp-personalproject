//1:: add cart 
//2:: show all products cart
//3:: delete product cart


const prisma = require("../configs/prisma")
const createError = require("../utils/createError")
const productDataService = require("../services/productData-service")

exports.add = async (req, res, next) => {
    try {
        const { productId, qty } = req.body;
        const buyerId = req.user.id; // มาจาก middleware authentication
        if (!Number(productId) || Number(qty) <= 0) {
            return createError(400,"Invalid productId or quantity" )
            
          }

        // ตรวจสอบว่าสินค้ามีอยู่หรือไม่
        const product = await productDataService.getProductById(productId)
  
        if (!product) {
            return createError(404,"Product not found" )
        }

        // ตรวจสอบว่ามีสินค้าในตะกร้าอยู่แล้วหรือไม่
        const existingCartItem = await prisma.productCart.findFirst({
        where: { buyerId: Number(buyerId), 
                productId: Number(productId) }
        });
  
        if (existingCartItem) {


        // ถ้ามีสินค้าอยู่แล้ว ให้เพิ่มจำนวน
        const updatedCartItem = await prisma.productCart.update({
          where: { id: existingCartItem.id },
          data: { qty: existingCartItem.qty + Number(qty) }
        });
        return res.json({ message: "Updated cart quantity", cartItem: updatedCartItem });
        }

        // ถ้ายังไม่มี ให้เพิ่มรายการใหม่
        const newCartItem = await prisma.productCart.create({
            data: { buyerId:Number(buyerId), 
                    productId:Number(productId), 
                    qty:Number(qty) }
        });
  
      res.json({ message: "Product added to cart successfully", products: newCartItem });
        
    } catch (error) {
        next(error)
    }
}

exports.show = async (req, res, next) => {
    try {
      const buyerId = Number(req.user.id);

      const cartItems = await prisma.productCart.findMany({
        where: { buyerId: buyerId },
        include: {
            product: {
                include: {
                    ProductImage: true // รวมข้อมูล ProductImage
                }
            }
        }
    });


      // Calculate total price
      const totalPrice = cartItems.reduce((acc, item) => {
          //console.log ("a",item.qty)
          return acc + (Number(item.qty?? 0) * Number(item.product.price ?? 1));           
      }, 0);

        res.json({  message: "show product cart", cartItems : cartItems , subTotalPrice : totalPrice });
    } catch (error) {
        next(error)
    }
}

exports.remove = async (req, res, next) => {
    try {
        const { productId, qty } = req.body;
        const buyerId = req.user.id;
        if (!Number(productId) || Number(qty) <= 0) {
            return createError(400,"Invalid productId or quantity" )
            
          }
        
        // ค้นหารายการสินค้าในตะกร้า
        const existingCartItem = await prisma.productCart.findFirst({
        where: { buyerId, productId }
      });

      if (!existingCartItem) {
        return createError(400,"Product not found in cart" )        
      }

      console.log(1)
      let textMessage =""
      if (existingCartItem.qty > qty) {
        // ลดจำนวนสินค้า
        const updatedCartItem = await prisma.productCart.update({
          where: { id: existingCartItem.id },
          data: { qty: existingCartItem.qty - qty }
        });
        textMessage = "Updated cart quantity"
        //return res.json({ message: "Updated cart quantity", cartItem: updatedCartItem , subTotalPrice : totalPrice});
      } else {
        // ถ้าจำนวนที่จะลบเท่ากับที่มี → ลบออกจากตะกร้าเลย
        await prisma.productCart.delete({
          where: { id: existingCartItem.id }
        });

        textMessage = "Product removed from cart"
        //return res.json({ message: "Product removed from cart" , subTotalPrice : totalPrice });
      }

            //---------------------------------------------
            const cartItems = await prisma.productCart.findMany({
              where: { buyerId: buyerId },
              include: {
                  product: {
                      include: {
                          ProductImage: true // รวมข้อมูล ProductImage
                      }
                  }
              }
          });
          // Calculate total price
            const totalPrice = cartItems.reduce((acc, item) => {
              //console.log ("a",item.qty)
              return acc + (Number(item.qty?? 0) * Number(item.product.price ?? 1));           
            }, 0);
          //---------------------------------------------
          return res.json({ message: textMessage , cartItems: cartItems , subTotalPrice : totalPrice });
        
    } catch (error) {
        next(error)
    }
}

exports.clear = async (req, res, next) => {
    
    try {
        
        const buyerId = req.user.id;

        // ตรวจสอบว่ามีสินค้าหรือไม่
        const cartItems = await prisma.productCart.findMany({
          where: { buyerId }
        });
    
        if (cartItems.length === 0) {
          return res.status(404).json({ error: "Cart is already empty" });
        }
    
        // ลบสินค้าทั้งหมดของผู้ใช้จากตะกร้า
        await prisma.productCart.deleteMany({
          where: { buyerId }
        });
    
        res.json({ message: "Cart cleared successfully" });



        res.json({ msg : "delete" });
    } catch (error) {
        next(error)
    }
}


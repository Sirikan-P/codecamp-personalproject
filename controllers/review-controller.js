//1:: add review
//2:: show products review 
//3:: update product review
//4:: delete product review

const prisma = require("../configs/prisma")
const createError = require("../utils/createError")

exports.add = async (req, res, next) => {

    try {
        const { productId, title, content, score, imageUrl } = req.body;
        const userId = req.user.id; // ผู้ใช้ที่ล็อกอิน

        // ตรวจสอบว่าผู้ใช้เคยซื้อสินค้านี้หรือไม่
        const hasOrdered = await prisma.orderProduct.findFirst({
            where: { productId, order: { buyerId: userId } }
        });

        if (!hasOrdered) {
            return createError(400, "You can only review purchased products.")
        }

        // สร้างรีวิว
        const review = await prisma.review.create({
            data: { productId, title, content, score, imageUrl }
        });

        res.status(201).json({ message: "Review added successfully", review });

    } catch (error) {
        next(error)
    }
}

exports.show = async (req, res, next) => {

    try {
        const productId = parseInt(req.params.productId);
        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: "desc" }
          });
      
          res.json({ reviews });
       
    } catch (error) {
        next(error)
    }
}

exports.update = async (req, res, next) => {
   
    try {
        const reviewId = parseInt(req.params.reviewId);
    const userId = req.user.id;
    const { title, content, score, imageUrl } = req.body;
   
    // ตรวจสอบว่าเป็นเจ้าของรีวิวหรือไม่
    const existingReview = await prisma.review.findFirst({
        where: { id: reviewId, product: { OrderProduct: { some: { order: { buyerId: userId } } } } }
      });
  
      if (!existingReview) {
        return res.status(403).json({ error: "You can only edit your own reviews." });
      }
  
      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: { title, content, score, imageUrl, updatedAt: new Date() }
      });
  
      res.json({ message: "Review updated successfully", review: updatedReview });



    } catch (error) {
        next(error)
    }
}

exports.delete = async (req, res, next) => {
    
    try {

    const reviewId = parseInt(req.params.reviewId);
    const userId = req.user.id;

    // ตรวจสอบว่าเป็นเจ้าของรีวิว หรือเป็น Admin
    const existingReview = await prisma.review.findFirst({
        where: { id: reviewId, product: { OrderProduct: { some: { order: { buyerId: userId } } } } }
      });
  
      if (!existingReview && req.user.role !== "ADMIN") {
        return createError(403,"You can only delete your own reviews.")
      }
  
      await prisma.review.delete({ where: { id: reviewId } });
  
      res.json({ message: "Review deleted successfully" });
       
    } catch (error) {
        next(error)
    }
}





exports.aa = async (req, res, next) => {  
    
    try {
        res.json({ msg: "aa" });
    } catch (error) {
        next(error)
    }
}

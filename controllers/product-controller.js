//1:: add product 
//2:: show all products 
//3:: show one product 
//4:: update product 
//5:: delete product 
const prisma = require("../configs/prisma")
const createError = require("../utils/createError")

exports.addProduct = async (req, res, next) => {

  const { productData, images } = req.body; //object & array of url

  try {
    const createdProduct = await prisma.$transaction(async (tx) => {
      // เพิ่มสินค้า
      const product = await tx.product.create({
        data: productData,
      });

      // เพิ่มรูปภาพของสินค้า
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((imageUrl) => ({
            imageUrl,
            productId: product.id,
          })),
        });
      }

      return product;
    });

    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    console.error(error);
    next(error)
  }
}

exports.showAllProducts = async (req, res, next) => {
  const sellerId = req.params.id
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: Number(sellerId) },
      include: {
        ProductImage: true, // ดึงข้อมูลรูปภาพของสินค้าด้วย
      },
    });

    res.json({ success: true, products });
  } catch (error) {
    console.error(error);
    next(error)
  }
}

exports.showProductDetail = async (req, res, next) => {
  const productId = req.params.id
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: {
        ProductImage: true, // ดึงข้อมูลรูปภาพทั้งหมดของสินค้า
      },
    });

    if (!product) {
      return createError(404, "Product not found")
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error)
  }
}

exports.updateProduct = async (req, res, next) => {
  const productId = req.params.id
  const { productData, images } = req.body;

  try {
    // ตรวจสอบว่าสินค้ามีอยู่จริงหรือไม่
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { ProductImage: true },
    });

    if (!existingProduct) {
      return createError(404,"Product not found")
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // อัปเดตข้อมูลสินค้า
      const product = await tx.product.update({
        where: { id: Number(productId) },
        data: productData,
      });

      // ลบรูปภาพเก่าทั้งหมดถ้ามีการส่งรูปภาพใหม่
      if (images && images.length > 0) {
        await tx.productImage.deleteMany({
          where: { productId: Number(productId) },
        });

        // เพิ่มรูปภาพใหม่
        await tx.productImage.createMany({
          data: images.map((imageUrl) => ({
            imageUrl,
            productId: Number(productId),
          })),
        });
      }

      return product;
    });

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error)
  }
}

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.id

  try {
    // ตรวจสอบว่าสินค้ามีอยู่จริงหรือไม่
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(productId)  },
      include: { ProductImage: true },
    });

    if (!existingProduct) {
      return createError(404,"Product not found")
    }

    // ใช้ transaction เพื่อลบทั้งรูปภาพและสินค้า
    await prisma.$transaction([
      prisma.productImage.deleteMany({
        where: { productId: Number(productId)  },
      }),
      prisma.product.delete({
        where: { id: Number(productId)  },
      }),
    ]);

    res.json({ success: true, message: "Product deleted successfully" });

  } catch (error) {
    next(error)
  }
}
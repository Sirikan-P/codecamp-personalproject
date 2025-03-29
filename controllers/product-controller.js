//1:: add product 
//2:: show all products 
//3:: show one product 
//4:: update product 
//5:: delete product 
const prisma = require("../configs/prisma")
const createError = require("../utils/createError")
const { getProductById } = require("../services/productData-service")

//file - pics
const cloudinary = require('../configs/cloudinary')
const fs = require('fs/promises')
const path = require('path')


exports.addProduct = async (req, res, next) => {
  try {
    // console.log(req.body)
    // console.log(req.file)
    // console.log(req.files)

    const  productData  = {...req.body }; //Form Data 
    if (!productData){
      return createError(400,"Missing required fields")
    }

    productData.qty = Number(productData.qty)
    productData.sellerId = Number(productData.sellerId)
    productData.approveBy = Number(productData.approveBy)
    productData.orderqty = Number(productData.orderqty)
  
    //upload cloudinary 
    if(!req.files || req.files.length === 0){
      return createError(400,"No image files")
    }

    let uploadedImages = []
    if(req.files){
      console.log("request files")
       //loop  
       uploadedImages = await Promise.all(
        req.files.map((file) => {
          return new Promise( (resolve, reject) => {

           const upload = async (fileData) => {
            const data =  await cloudinary.uploader.upload(fileData.path, {
                              overwrite: true,
                              folder: 'FurProduct',
                              public_id: path.parse(fileData.path).name 
                          })
                           fs.unlink(fileData.path)
                          resolve(data)
            }


            try {
               upload(file)
            } catch (error) {
              reject(error)
            }
          });
        })
      );
      console.log(5)
    }   
    console.log(uploadedImages)
    const createdProduct = await prisma.$transaction(async (tx) => {
      // เพิ่มสินค้า
      const product = await tx.product.create({
        data: productData,
      });

      // เพิ่มรูปภาพของสินค้า
      if (uploadedImages && uploadedImages.length > 0) {
        await tx.productImage.createMany({
          data: uploadedImages.map((el) => ({
            imageUrl: el.secure_url,
            productId: product.id,
          })),
        });
      }

      return product;
    });

    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    console.error(error);
    next(error)
  }
}
//-----------------------------------------------------------
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
//-----------------------------------------------------------
exports.showProductDetail = async (req, res, next) => {
  const productId = req.params.id
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: {
        ProductImage: true,         // ดึงข้อมูลรูปภาพทั้งหมดของสินค้า
        seller: true,
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
//-------------------------------------------------------
exports.updateProduct = async (req, res, next) => {
try {
  const { id } = req.params 
  const  updatedData = { ...req.body }

    console.log("body" ,req.body)
    console.log("param" ,req.params )
    console.log(req.files)

    // ตรวจสอบว่าสินค้ามีอยู่หรือไม่ ด้วย services component
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    return next(createError(404, "Product not found"));
  }
  //----
  // แปลงค่าที่จำเป็นให้เป็นตัวเลข
  updatedData.qty = Number(updatedData.qty);
  updatedData.sellerId = Number(updatedData.sellerId);
  updatedData.approveBy = Number(updatedData.approveBy);
  updatedData.orderqty = Number(updatedData.orderqty);


  // อัปโหลดรูปภาพใหม่ถ้ามีไฟล์แนบมา
  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = await Promise.all(
      req.files.map((file) => {
        return new Promise(async (resolve, reject) => {
          try {
            const uploadResult = await cloudinary.uploader.upload(file.path, {
              overwrite: true,
              folder: 'FurProduct',
              public_id: path.parse(file.path).name,
            });

            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting temp file:", err);
            });

            resolve(uploadResult);
          } catch (error) {
            reject(error);
          }
        });
      })
    );
  }


  // ใช้ transaction เพื่ออัปเดตข้อมูลสินค้าและรูปภาพ
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // อัปเดตข้อมูลสินค้า
      const product = await tx.product.update({
        where: { id: Number(id) },
        data: updatedData,
      });

      // ไม่มีไฟล์ใหม่แนบมา -> ใช้ไฟล์เดิม
      // หากมีการอัปโหลดรูปภาพใหม่ ให้ลบรูปเก่าแล้วเพิ่มใหม่
      if (uploadedImages.length > 0) {
        await tx.productImage.deleteMany({ where: { productId: product.id } });

        await tx.productImage.createMany({
          data: uploadedImages.map((el) => ({
            imageUrl: el.secure_url,
            productId: product.id,
          })),
        });
      }

      return product;
    });

    res.status(200).json({ success: true, data: updatedProduct });
} catch (error) {
  next(error);
}
}
//-------------------------------------------------------
exports.deleteProduct = async (req, res, next) => {
  try {  
    const { id } = req.params 
    const productId = id

    // ตรวจสอบว่าสินค้ามีอยู่จริงหรือไม่
    // ตรวจสอบว่าสินค้ามีอยู่หรือไม่ ด้วย services component
    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      return createError(404, "Product not found");
    }

    console.log(productId)

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
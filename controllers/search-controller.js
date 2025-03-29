//1:: show products , sort paginage
// :: show products , filter by room ,category  ,  keyword
// :: show products , one 

const prisma = require("../configs/prisma")
const createError = require("../utils/createError")

exports.searchProduct = async (req, res) => {
    const { category, keyword, minPrice, maxPrice, sortBy, sortOrder, page, limit } = req.query;
    try { 


        // ค่าเริ่มต้นของ Pagination
    const pageNumber = parseInt(page) || 1; // หน้าเริ่มต้น = 1
    const pageSize = parseInt(limit) || 10; // จำนวนสินค้าต่อหน้า = 10
    const skip = (pageNumber - 1) * pageSize; // คำนวณจำนวนรายการที่ต้องข้าม


    // ค่าเริ่มต้นของการเรียงลำดับ (Default: เรียงตามวันที่สร้างใหม่สุด)
    const sortField = sortBy || "createdAt"; // สามารถเลือก sortBy = price, productName ได้
    const sortDirection = sortOrder === "asc" ? "asc" : "desc"; // เรียงจากน้อยไปมาก หรือมากไปน้อย
    
    // ค้นหาสินค้าตามเงื่อนไขที่กำหนด
    const products = await prisma.product.findMany({
      where: {
        AND: [
          (category !="*")&&(category) ? { category : category.toUpperCase() } : {}, // กรองตามหมวดหมู่
          keyword
            ? {
                OR: [
                    { productName: { contains: keyword.toLowerCase() } }, // ค้นหาชื่อสินค้า
                    { description: { contains: keyword.toLowerCase() } }, // ค้นหาในคำอธิบาย
                    { Brand: { contains: keyword.toLowerCase() } }, // ค้นหาตามยี่ห้อ
                    { style: { contains: keyword.toLowerCase() } }, // ค้นหาตามสไตล์
                  ],
              }
            : {},
          minPrice ? { price: { gte: parseFloat(minPrice) } } : {}, // ราคาขั้นต่ำ
          maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {}, // ราคาสูงสุด
          { qty: { gt: prisma.product.fields.orderqty } } 
        ],
      },
      include: {
        ProductImage: true, // ดึงข้อมูลรูปภาพของสินค้า
      },
      orderBy: {
        [sortField]: sortDirection, // เรียงลำดับตามเงื่อนไข
      },
      skip: skip, // ข้ามข้อมูลสำหรับแบ่งหน้า
      take: pageSize, // จำนวนข้อมูลที่ต้องการต่อหน้า
    });

    // นับจำนวนสินค้าทั้งหมดที่ตรงกับเงื่อนไข (เพื่อใช้ในการแบ่งหน้า)
    const totalProducts = await prisma.product.count({
      where: {
        AND: [
          (category !="*")&&(category) ? { category: category.toUpperCase() } : {},
          keyword
            ? {
                OR: [
                    { productName: { contains: keyword.toLowerCase() } }, // ค้นหาชื่อสินค้า
                    { description: { contains: keyword.toLowerCase() } }, // ค้นหาในคำอธิบาย
                    { Brand: { contains: keyword.toLowerCase() } }, // ค้นหาตามยี่ห้อ
                    { style: { contains: keyword.toLowerCase() } }, // ค้นหาตามสไตล์
                  ],
              }
            : {},
          minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
          maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
        ],
      },
    });
    
    res.json({
      success: true,
      totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / pageSize),
      products,
    });

    } catch (error) {
        console.error(error);
        next(error)
      }
    }




  exports.searchProductDetail = async (req, res, next) => {
    const productId = Number(req.params.id)
   
    try {  
        const product = await prisma.product.findUnique({
            where: { id: Number(productId) },
            include: {
              ProductImage: true, // ดึงข้อมูลรูปภาพทั้งหมดของสินค้า
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
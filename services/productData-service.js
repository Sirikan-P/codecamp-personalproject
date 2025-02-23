//connect db 
const prisma = require("../configs/prisma")

exports.getProductById = (id) => {
    return  prisma.product.findUnique({
        where: { id: Number(id) }
      });
}
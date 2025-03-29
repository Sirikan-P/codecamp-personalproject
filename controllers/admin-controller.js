//1:: show all user
//2:: get one user
//3:: activate user
//4:: activate product 
//5:: add admin 
//6:: delete admin


const prisma = require("../configs/prisma")
const createError = require("../utils/createError")

exports.add = async (req, res, next) => {
    const { data} = req.body;
    try {
        res.json({ msg : "Add" });
    } catch (error) {
        next(error)
    }
}

exports.show = async (req, res, next) => {
    const { data} = req.body;
    try {
        res.json({ msg : "show data" });
    } catch (error) {
        next(error)
    }
}

exports.update = async (req, res, next) => {
    const { data} = req.body;
    try {

    const productId = parseInt(req.params.productId);
    const data = req.body;

    const updatedProduct = await prisma.product.update({ where: { id: productId }, data });

    res.json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        next(error)
    }
}

//-------------------------------------------------
exports.getUser = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
        res.json({ users });
    } catch (error) {
        next(error)
    }
}

exports.updateUser = async (req, res, next) => {

    try {
        const userId = parseInt(req.params.userId);
        const { role } = req.body;
    
        const updatedUser = await prisma.user.update({ where: { id: userId }, data: { role } });
    
        res.json({ message: "User role updated successfully", user: updatedUser });
    } catch (error) {
        next(error)
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);
        await prisma.user.delete({ where: { id: userId } });
    
        res.json({ message: "User deleted successfully" });


    } catch (error) {
        next(error)
    }
}
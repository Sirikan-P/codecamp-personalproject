//1:: list  user
//2:: update role

const prisma = require("../configs/prisma")

exports.listProfile= async (req,res,next)=>{
    try {
        console.log(req.user)
        const {id, email } = req.user
        const profile = await prisma.user.findFirst({
            where:{
                id: Number(id)                
            },
        })
            //console.log(users)
        res.json({ result : profile})
    } catch (error) {
        next(error)
    }
}

exports.updateProfile= async(req,res,next)=>{
    try {
        const {id ,shopName,phoneNumber} = req.body
            //console.log(id,role)
        const updated = await prisma.user.update({
            where:{
                id: Number(id)                
            },
            data: {
                phoneNumber : phoneNumber ,
                shopName: shopName , 
            }
        })
        res.json({message: "update success"})
    } catch (error) {
        next(error)
    }
}
//1:: list  user
//2:: update profile

const prisma = require("../configs/prisma")

//file - pics
const cloudinary = require('../configs/cloudinary')
const fs = require('fs/promises')
const path = require('path')

const createError = require("../utils/createError")

//--------------
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
//--------------
exports.updateProfile= async(req,res,next)=>{
    try {
        const { id } = req.params
        const newData = req.body
        const haveFile = !!req.file

        let uploadResult = {}

        const userData = await prisma.user.findUnique({
            where: {
                id: +id
            }
        })       
        if (!userData) {
            createError(400, 'user not found')
        }
        console.log(req.file)
        //-------------------------------------------------
        if (haveFile) {
            uploadResult = await cloudinary.uploader.upload(req.file.path, {
                overwrite: true,
                folder: 'FurUser',
                public_id: path.parse(req.file.path).name 
            })
            fs.unlink(req.file.path)
        }

        const data = haveFile 
                    ?  {...newData , profileImage : uploadResult.secure_url }
                    :  newData
        console.log(data)

        const updated = await prisma.user.update({
            where:{
                id: Number(id)                
            },
            data: data
        })

        res.json({message: "update success" , data : updated  })
    } catch (error) {
        next(error)
    }
}
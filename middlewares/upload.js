const multer = require("multer")
const path = require('path')

const storage = multer.diskStorage({
    destination:    (req,file , cb) => cb(null, path.join(__dirname ,'../upload-pic')),
    filename:       (req,file, cb)=> {
                            
                            let fileExt = path.extname(file.originalname)
                            cb(null , `pic_${Date.now()}_${Math.round(Math.random()*100)}${fileExt}`)
                            }
})


module.exports =  multer({storage : storage})
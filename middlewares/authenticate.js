// import lib...
const createError = require("../utils/createError")
const jwt = require("jsonwebtoken")



exports.authorize = async (req, res , next) => {
    try {
        //------------------------------------
        //step 1 get header from client
        //step 2 check having token
        //step 3 remove bearer from token 
        //step 4 verify token by jwt
        //------------------------------------
        //step 1 
        const authorization = req.headers.authorization        
        //step 2 
        if (!authorization){
            return createError(400,'missing token')
        }
        //step 3
        const token = authorization.split(" ")[1] //convert to Array
            //-- console.log(token)
        //step 4
        jwt.verify(token,process.env.SECRET,(err,decode)=>{
                //-- console.log(err)
                //-- console.log(decode)
            if(err){
                return createError(401,"unauthorized")
            }
            //--create property user from decode 
            req.user = decode
                //console.log(req)
            next()
        })
    } catch (error) {
        next(error)
    }
}
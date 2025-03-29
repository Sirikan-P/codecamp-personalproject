const handleErrors = (err,req,res,next)=>{
    console.log(err)
   // console.log("step 3 handle error")
    res
    .status( err.statusCode || 500)
    .json({ message: err.message || "Something wrong" })

}

module.exports = handleErrors
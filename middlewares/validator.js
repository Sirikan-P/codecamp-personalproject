const { z } = require("zod")

exports.registerSchema = z.object({
    email: z.string().email("check email format"),
    firstname: z.string().min(3, "firstname more than 3 characters"),
    lastname: z.string().min(3, "Lastname more than 3 characters"),
    password: z.string().min(6, "password at least 6 characters"),
    confirmPassword: z.string().min(6, "confirm password at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
    message: "confirm password incorrect",
    path: ['confirmPassword']
})

exports.loginSchema = z.object({
    email: z.string().email("check email format"),
    password: z.string().min(6, "password at least 6 characters"),

})

exports.productSchema = z.object({
    productName : z.string().min(3,"productname more than 3 characters"),
    price : z.number().int("price must be number"),
    deliveryFee : z.number().int("delivery fee must be number"),
    
})

exports.validateWithZod = (schema) => (req, res, next) => {
    try {
        console.log('hello middleware')
        schema.parse(req.body) // call 
        next() //*** next step controller */
    } catch (error) {
        //console.log(error.errors[1].message)
        //prepare error
        const errMsg = error.errors.map((el) => el.message)
        const errTxt = errMsg.join(",")
        const mergeError = new Error(errTxt)
        next(mergeError)
    }
}
//1:: add order 
//2:: show buyer order
//3:: show seller order
//4:: update status order

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
        res.json({ msg : "update" });
    } catch (error) {
        next(error)
    }
}

exports.delete = async (req, res, next) => {
    const { data} = req.body;
    try {
        res.json({ msg : "delete" });
    } catch (error) {
        next(error)
    }
}


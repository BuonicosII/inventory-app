const Category = require("../models/category")
const asyncHandler = require("express-async-handler")

exports.category_detail = asyncHandler( async (req, res, next) => {
    res.send('Here comes the category detail')
})
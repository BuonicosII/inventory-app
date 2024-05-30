const Plant = require("../models/plant")
const asyncHandler = require("express-async-handler")

exports.plant_detail = asyncHandler( async (req, res, next) => {
    res.send('Here comes the plant detail')
})
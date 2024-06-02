const Plant = require("../models/plant")
const Category = require("../models/category")
const asyncHandler = require("express-async-handler")

exports.plant_detail = asyncHandler( async (req, res, next) => {

    const [searchedCategory, searchedPlant] = await Promise.all([
        Category.findOne({ uri: req.params.catUri}).exec(),
        Plant.findOne({ uri: req.params.plantUri}).exec()
    ])
    
    if (searchedCategory === null || searchedPlant === null) {
        const err = new Error("Page not found")
        err.status = 404;
        return next(err);
    }

    res.render("plant", { plant: searchedPlant})
})
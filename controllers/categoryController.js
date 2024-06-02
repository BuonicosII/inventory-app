const Category = require("../models/category")
const Plant = require("../models/plant")

const asyncHandler = require("express-async-handler")

exports.category_detail = asyncHandler( async (req, res, next) => {
    
    const searchedCategory = await Category.findOne({ uri: req.params.catUri}).exec()

    if (searchedCategory === null) {
        const err = new Error("Page not found")
        err.status = 404;
        return next(err);
    }

    const allPlants = await Plant.find({ category: searchedCategory.id}).populate("category").exec()


    res.render("category", { title: searchedCategory.name, plants_in_category: allPlants})
})
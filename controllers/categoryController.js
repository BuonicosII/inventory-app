const Category = require("../models/category")
const Plant = require("../models/plant")
const { body, validationResult } = require("express-validator");
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

exports.create_category_get = (req, res, next) => {
    res.render('add_category_form', { title: 'Add category' });
}

exports.create_category_post = [
    body("name").trim().isLength({ min: 1}).escape().withMessage("Category must have a a name")
    //.isAlphanumeric().withMessage("Name must be alphanumeric!")
    ,
    asyncHandler( async (req, res, next) => {
        const errors = validationResult(req)

        const category = new Category({
            name: req.body.name,
            uri: req.body.name.toLowerCase().replace(/\s+/g, "-")
        })

        if (!errors.isEmpty()) {
            res.render('add_category_form', { title: 'Add category', category: category, errors: errors.array() })
            return;
        } else {
            await category.save()
            res.redirect(category.url)
        }
    })
]
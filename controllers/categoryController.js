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


    res.render("category", { title: searchedCategory.name, plants_in_category: allPlants, id: searchedCategory.id})
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

        } else {
            await category.save()
            res.redirect(category.url)
        }
    })
]

exports.update_category_get =  asyncHandler( async (req, res, next) => {

    const category = await Category.findById(req.query.id).exec()

    if (category === null) {
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render('add_category_form', { title: 'Update category', category: category })
})

exports.update_category_post = [
    body("name").trim().isLength({ min: 1}).escape().withMessage("Category must have a a name")
    //.isAlphanumeric().withMessage("Name must be alphanumeric!")
    ,
    asyncHandler( async (req, res, next) => {
        const errors = validationResult(req)

        const category = new Category({
            name: req.body.name,
            uri: req.body.name.toLowerCase().replace(/\s+/g, "-"),
            _id: req.query.id
        })

        if (!errors.isEmpty()) {
            res.render('add_category_form', { title: 'Update category', category: category, errors: errors.array() })

        } else {
            await Category.findByIdAndUpdate(req.query.id, category, {})
            res.redirect(category.url)
        }
    })
]

exports.category_delete_get = asyncHandler(async (req, res, next) => {

    const [category, plants] = await Promise.all([
      Category.findById(req.query.id).exec(),
      Plant.find({ category: req.query.id }).populate("category").exec(),
    ]);
  
    if (category === null) {
      // No results.
      res.redirect("/");
    }
  
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      plants: plants,
    });
  });

exports.category_delete_post = asyncHandler( async (req, res, next) => {
    
    const [category, plants] = await Promise.all([
        Category.findById(req.body.categoryid).exec(),
        Plant.find({ category: req.body.categoryid }).populate("category").exec(),
      ]);
    
      if (plants.length > 0) {
        res.render("category_delete", {
            title: "Delete Category",
            category: category,
            plants: plants,
          });
      } else {
        await Category.findByIdAndDelete(req.body.categoryid)
        res.redirect("/")
      }
    

});

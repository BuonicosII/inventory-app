const Plant = require("../models/plant")
const Category = require("../models/category")
const { body, validationResult } = require("express-validator")
const asyncHandler = require("express-async-handler")

exports.plant_detail = asyncHandler( async (req, res, next) => {

    const [searchedCategory, searchedPlant] = await Promise.all([
        Category.findOne({ uri: req.params.catUri}).exec(),
        Plant.findOne({ uri: req.params.plantUri}).populate("category").exec()
    ])
    
    if (searchedCategory === null || searchedPlant === null) {
        const err = new Error("Page not found")
        err.status = 404;
        return next(err);
    }

    res.render("plant", { plant: searchedPlant})
})

exports.create_plant_get = asyncHandler( async (req, res, next) => {

    const categories = await Category.find().exec()

    res.render('add_plant_form', { title: 'Add plant', categories: categories });
})

exports.create_plant_post = [

    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category =
              typeof req.body.category === "undefined" ? [] : [req.body.category];
          }
        next()
    },
    body("name").trim().isLength({ min: 1}).escape().withMessage("Plant must have a name"),
    body("description").trim().isLength({ min: 1}).escape().withMessage("Plant must have a description"),
    body("stock").trim().isLength({ min: 1}).escape().isInt({ min: 1}).withMessage("Stock must at least be 1"),
    body("price").trim().isLength({ min: 1}).escape().isInt({min: 1}).withMessage("Price must be greater than zero"),
    body("main").trim().isLength({ min: 1}).escape().withMessage("Plant must have a main category"),
    body("category.*").escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const plant = new Plant({
            name: req.body.name,
            description: req.body.description,
            inStock: req.body.stock,
            price: req.body.price,
            category: [req.body.main].concat(req.body.category.filter( cat => cat !== req.body.main)),
            uri: req.body.name.toLowerCase().replace(/\s+/g, "-")
        })

        const categories = await Category.find().exec()

        if (!errors.isEmpty()) {

            res.render('add_plant_form', { title: 'Add plant', categories: categories, plant: plant, errors: errors.array() });

        } else {
            await plant.save(),
            res.redirect(`/${categories.find( ({ id }) => id === req.body.main).uri}/${plant.uri}`)
        }
    })
]

exports.update_plant_get = asyncHandler( async (req, res, next) => {

    const [plant, categories] = await Promise.all([
        Plant.findById(req.query.id).populate("category").exec(),
        Category.find().exec()
    ])

    if (plant === null) {
        const err = new Error("Plant not found");
        err.status = 404;
        return next(err);
    }

    res.render('add_plant_form', { title: 'Update plant', categories: categories, plant: plant })
})

exports.update_plant_post = [

    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category =
              typeof req.body.category === "undefined" ? [] : [req.body.category];
          }
        next()
    },
    body("name").trim().isLength({ min: 1}).escape().withMessage("Plant must have a name"),
    body("description").trim().isLength({ min: 1}).escape().withMessage("Plant must have a description"),
    body("stock").trim().isLength({ min: 1}).escape().isInt({ min: 1}).withMessage("Stock must at least be 1"),
    body("price").trim().isLength({ min: 1}).escape().isInt({min: 1}).withMessage("Price must be greater than zero"),
    body("main").trim().isLength({ min: 1}).escape().withMessage("Plant must have a main category"),
    body("category.*").escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const plant = new Plant({
            name: req.body.name,
            description: req.body.description,
            inStock: req.body.stock,
            price: req.body.price,
            category: [req.body.main].concat(req.body.category.filter( cat => cat !== req.body.main)),
            uri: req.body.name.toLowerCase().replace(/\s+/g, "-"),
            _id: req.query.id
        })

        const categories = await Category.find().exec()

        if (!errors.isEmpty()) {

            res.render('add_plant_form', { title: 'Update plant', categories: categories, plant: plant, errors: errors.array() });

        } else {
            await Plant.findByIdAndUpdate(req.query.id, plant, {})
            res.redirect(`/${categories.find( ({ id }) => id === req.body.main).uri}/${plant.uri}`)
        }
    })
]

exports.delete_plant_get = asyncHandler(async (req, res, next) => {

    const plant = await Plant.findById(req.query.id).populate("category").exec()
  
    if (plant === null) {
      // No results.
      res.redirect("/");
    }
  
    res.render("plant_delete", {
      title: "Delete Plant",
      plant: plant
    });
  });

exports.delete_plant_post = asyncHandler( async (req, res, next) => {

    await Plant.findByIdAndDelete(req.body.plantid)
    res.redirect("/")
    }
);

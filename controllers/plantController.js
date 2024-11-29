const db = require("../db/queries");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const upload = require("../multer-config");
const cloudinary = require("../cloudinary-config");

exports.plant_detail = asyncHandler(async (req, res, next) => {
  const [searchedCategory, searchedPlant] = await Promise.all([
    await db.getCategoryByUri(req.params.catUri),
    await db.getPlantByUri(req.params.plantUri),
  ]);

  if (searchedCategory[0] === undefined || searchedPlant[0] === undefined) {
    const err = new Error("Page not found");
    err.status = 404;
    return next(err);
  }

  res.render("plant", { plant: searchedPlant[0] });
});

exports.create_plant_get = asyncHandler(async (req, res, next) => {
  const categories = await db.getAllCategories();

  res.render("add_plant_form", { title: "Add plant", categories: categories });
});

exports.create_plant_post = [
  upload.single("image"),
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Plant must have a name"),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Plant must have a description"),
  body("stock")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isInt({ min: 1 })
    .withMessage("Stock must at least be 1"),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isInt({ min: 1 })
    .withMessage("Price must be greater than zero"),
  body("main")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Plant must have a main category"),
  body("category.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const plant = {
      name: req.body.name,
      description: req.body.description,
      inStock: req.body.stock,
      price: req.body.price,
      category: [Number(req.body.main)].concat(
        req.body.category.map((cat) => {
          if (cat !== req.body.main) return Number(cat);
        })
      ),
      uri: req.body.name.toLowerCase().replace(/\s+/g, "-"),
      imageUrl: "",
    };
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cloudImage = await cloudinary.uploader.upload(dataURI);
      plant.imageUrl = cloudImage.url;
    }

    const categories = await db.getAllCategories();

    if (!errors.isEmpty()) {
      res.render("add_plant_form", {
        title: "Add plant",
        categories: categories,
        plant: plant,
        errors: errors.array(),
      });
    } else {
      await db.createNewPlant(plant),
        res.redirect(
          `/${categories
            .find(({ id }) => id === Number(req.body.main))
            .name.toLowerCase()
            .replace(/\s+/g, "-")}/${plant.uri}`
        );
    }
  }),
];

exports.update_plant_get = asyncHandler(async (req, res, next) => {
  const [plant, categories] = await Promise.all([
    Plant.findById(req.query.id).populate("category").exec(),
    Category.find().exec(),
  ]);

  if (plant === null) {
    const err = new Error("Plant not found");
    err.status = 404;
    return next(err);
  }

  res.render("add_plant_form", {
    title: "Update plant",
    categories: categories,
    plant: plant,
    update: "update",
  });
});

exports.update_plant_post = [
  upload.single("image"),
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Plant must have a name"),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Plant must have a description"),
  body("stock")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isInt({ min: 1 })
    .withMessage("Stock must at least be 1"),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isInt({ min: 1 })
    .withMessage("Price must be greater than zero"),
  body("main")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Plant must have a main category"),
  body("category.*").escape(),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("You must insert the password")
    .equals("password")
    .withMessage("Wrong password!"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const plant = new Plant({
      name: req.body.name,
      description: req.body.description,
      inStock: req.body.stock,
      price: req.body.price,
      category: [req.body.main].concat(
        req.body.category.filter((cat) => cat !== req.body.main)
      ),
      uri: req.body.name.toLowerCase().replace(/\s+/g, "-"),
      _id: req.query.id,
    });

    if (req.body.newImage && !req.file) {
      plant.imageUrl = "";
    }

    if (req.body.newImage && req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cloudImage = await cloudinary.uploader.upload(dataURI);
      plant.imageUrl = cloudImage.url;
    }

    const categories = await Category.find().exec();

    if (!errors.isEmpty()) {
      const newArray = await Promise.all(
        plant.category.map((id) => {
          return Category.findById(id).exec();
        })
      );

      plant.category = newArray;

      res.render("add_plant_form", {
        title: "Update plant",
        categories: categories,
        plant: plant,
        update: "update",
        errors: errors.array(),
      });
    } else {
      await Plant.findByIdAndUpdate(req.query.id, plant, {});
      res.redirect(
        `/${categories.find(({ id }) => id === req.body.main).uri}/${plant.uri}`
      );
    }
  }),
];

exports.delete_plant_get = asyncHandler(async (req, res, next) => {
  const plant = await Plant.findById(req.query.id).populate("category").exec();

  if (plant === null) {
    // No results.
    res.redirect("/");
  }

  res.render("plant_delete", {
    title: "Delete Plant",
    plant: plant,
    confirm: req.query.confirm,
  });
});

exports.delete_plant_post = [
  body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("You must insert the password")
    .equals("password")
    .withMessage("Wrong password!"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const plant = await Plant.findById(req.query.id)
      .populate("category")
      .exec();

    if (!errors.isEmpty()) {
      res.render("plant_delete", {
        title: "Delete Plant",
        plant: plant,
        confirm: req.query.confirm,
        errors: errors.array(),
      });
    } else {
      await Plant.findByIdAndDelete(req.body.plantid);
      res.redirect("/");
    }
  }),
];

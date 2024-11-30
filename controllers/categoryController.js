const db = require("../db/queries");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.category_detail = asyncHandler(async (req, res, next) => {
  const searchedCategory = await db.getCategoryByUri(req.params.catUri);

  if (searchedCategory[0] === undefined) {
    const err = new Error("Page not found");
    err.status = 404;
    return next(err);
  }

  const allPlants = await db.getPlantsByCategory(searchedCategory[0].id);

  res.render("category", {
    title: searchedCategory[0].name,
    plants_in_category: allPlants,
    id: searchedCategory[0].id,
  });
});

exports.create_category_get = (req, res, next) => {
  res.render("add_category_form", { title: "Add category" });
};

exports.create_category_post = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category must have a a name"),
  //.isAlphanumeric().withMessage("Name must be alphanumeric!")
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = {
      name: req.body.name,
      uri: req.body.name.toLowerCase().replace(/\s+/g, "-"),
    };

    if (!errors.isEmpty()) {
      res.render("add_category_form", {
        title: "Add category",
        category: category,
        errors: errors.array(),
      });
    } else {
      await db.createCategory(category);
      res.redirect(category.uri);
    }
  }),
];

exports.update_category_get = asyncHandler(async (req, res, next) => {
  const category = await db.getCategoryById(req.query.id);

  if (category[0] === undefined) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("add_category_form", {
    title: "Update category",
    category: category,
    update: "update",
  });
});

exports.update_category_post = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category must have a a name"),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("You must insert the password")
    .equals("password")
    .withMessage("Wrong password!"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = {
      name: req.body.name,
      uri: req.body.name.toLowerCase().replace(/\s+/g, "-"),
      id: req.query.id,
    };

    if (!errors.isEmpty()) {
      res.render("add_category_form", {
        title: "Update category",
        category: category,
        errors: errors.array(),
        update: "update",
      });
    } else {
      await db.updateCategory(category);
      res.redirect(category.uri);
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, plants] = await Promise.all([
    db.getCategoryById(req.query.id),
    db.getPlantsByCategory(req.query.id),
  ]);

  if (category[0] === undefined) {
    // No results.
    res.redirect("/");
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category[0],
    plants: plants,
    confirm: req.query.confirm,
  });
});

exports.category_delete_post = [
  body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("You must insert the password")
    .equals("password")
    .withMessage("Wrong password!"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const [category, plants] = await Promise.all([
      db.getCategoryById(req.body.categoryid),
      db.getPlantsByCategory(req.body.categoryid),
    ]);

    if (plants.length > 0) {
      res.render("category_delete", {
        title: "Delete Category",
        category: category[0],
        plants: plants,
      });
    } else if (!errors.isEmpty()) {
      res.render("category_delete", {
        title: "Delete Category",
        category: category[0],
        plants: plants,
        confirm: req.query.confirm,
        errors: errors.array(),
      });
    } else {
      await db.deleteCategory(req.body.categoryid);
      res.redirect("/");
    }
  }),
];

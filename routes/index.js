var express = require('express');
var router = express.Router();

const category_controller = require("../controllers/categoryController")
const plant_controller = require("../controllers/plantController")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/:catUri", category_controller.category_detail);

router.get("/:catUri/:plantUri", plant_controller.plant_detail);

module.exports = router;

var express = require('express');
var router = express.Router();

const category_controller = require("../controllers/categoryController")
const plant_controller = require("../controllers/plantController")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/:catUri", category_controller.category_detail);

//should I rather put this router inside the category controller?
router.get("/:catUri/:planturi", plant_controller.plant_detail_detail);

module.exports = router;

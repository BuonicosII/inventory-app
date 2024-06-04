var express = require('express');
var router = express.Router();

const category_controller = require("../controllers/categoryController")
const plant_controller = require("../controllers/plantController")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Verde Vivarium' });
});

router.get('/add-category', category_controller.create_category_get);

router.post('/add-category', category_controller.create_category_post)

router.get("/:catUri", category_controller.category_detail);

router.get("/:catUri/:plantUri", plant_controller.plant_detail);

module.exports = router;

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

router.get('/add-plant', plant_controller.create_plant_get)

router.post('/add-plant', plant_controller.create_plant_post)

router.get('/update-category', category_controller.update_category_get)

router.post('/update-category', category_controller.update_category_post)

router.get('/delete-category', category_controller.category_delete_get)

router.post('/delete-category', category_controller.category_delete_post)

router.get('/update-plant', plant_controller.update_plant_get)

router.post('/update-plant', plant_controller.update_plant_post)

router.get('/delete-plant', plant_controller.delete_plant_get)

router.post('/delete-plant', plant_controller.delete_plant_post)

router.get("/:catUri", category_controller.category_detail);

router.get("/:catUri/:plantUri", plant_controller.plant_detail);

module.exports = router;

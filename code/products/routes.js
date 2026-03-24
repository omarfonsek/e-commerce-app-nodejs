const express = require("express");
const router = express.Router();
const products = require('./product.controller');


router.post("/", products.createProduct);


module.exports = router;










